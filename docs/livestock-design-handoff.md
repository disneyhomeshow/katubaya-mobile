# Livestock: design handoff

Brief for the designer (human or agent) who will design new screens for the livestock
capability of katubaya. Everything below is implemented in `development` (commit `c10c7f3`)
with a functional, minimal UI. Your job is to design the screens properly, keeping every
capability listed in §4 working, and to decide which of the opportunities in §9 to take.

Read first: `DESIGN.md` (tokens, type scale, components, writing and accessibility rules all
apply), then this file. Code pointers are at the end for anything you need to confirm.

---

## 1. Context

- **Product.** Local-first PWA for a Brazilian smallholder who runs agroforestry **and**
  livestock on the same site. Logs production in the field in under 30 seconds, tracks
  stock and expiry, and once a week turns stock into a WhatsApp availability message.
- **Platform.** Mobile web, 375 px first, one hand, sunlight. Light and dark. React + shadcn.
- **Audience.** The same farmer for everything: milks cows in the morning, collects eggs,
  harvests bananas, makes cheese on Thursday, slaughters chickens for a customer. No
  separate "livestock app" or role; livestock is woven into the existing flows.
- **Language.** UI is pt-BR with an en locale. Every string lives in `src/i18n/locales/*.json`;
  §8 lists the exact copy you must use or propose changes to.

## 2. Vocabulary (fixed, do not rename)

| Term in UI (pt-BR) | Meaning | Code name |
| --- | --- | --- |
| **Produto** | Anything the farm produces and may sell: banana, leite, ovos, queijo, mel. Replaced "Cultura". | `Crop` |
| **Produção** | The event that creates stock: colheita, ordenha, coleta de ovos, abate, processamento. Replaced "Colheita" as the generic label. | `HarvestEvent` |
| **Lote** | A batch of one product with its own quantity and expiry date. | `Lot` |
| **Lote de animais** | A group of animals managed together (vacas em lactação, frangos lote 3, colmeias do fundo). Always the full phrase, never just "lote". | `AnimalGroup` |
| **Cabeças** | Headcount of a lote de animais. Integer. | `headcount` |
| **Espécie** | Bovinos, Aves, Suínos, Caprinos, Ovinos, Abelhas, Peixes, Outros. | `Species` |
| **Zona ou pasto** | A named area of the site; used by production and by animal lots. | `Zone` |
| **Processamento** | Turning stock of one product into another (leite → queijo). | `createFromProcessing` |
| **Abate** | Removing heads from a lote de animais, optionally registering the meat produced. | reason `slaughter` |
| **Ajuste** | Any manual change of quantity (stock) or heads (animals) with a reason. | `InventoryAdjustment` / `AnimalAdjustment` |

## 3. Data available to screens

```text
CropCategory  id, name, type ('fruits'…'roots' | 'animal' | 'custom'), icon (emoji), color
Crop          id, categoryId, name, defaultUnit, shelfLifeDaysDefault, pricePerUnit?, isFavorite, notes?
Cultivar      id, cropId, name, shelfLifeDaysOverride?            ("Variedade"; for animals it can be a breed)
Zone          id, name, sortOrder
AnimalGroup   id, name, species, initialHeadcount, headcount, zoneId?, startedAt, notes?
AnimalAdjustment id, groupId, delta (+/−), reason, notes?, adjustedAt, harvestEventId?   (slaughter → meat harvest)
HarvestEvent  id, cropId, cultivarId?, zoneId?, quantity, unit, harvestedAt, notes?, lotId, animalGroupId?
Lot           id, cropId, cultivarId?, zoneId?, harvestEventId, initialQuantity, quantityRemaining, unit,
              harvestedAt, expiresAtEstimate, notes?
InventoryAdjustment id, lotId, cropId, quantityDelta, unit, reason, notes?, adjustedAt, harvestEventId?
              (reason 'processing' → the output harvest)
```

Relationships that matter for design:

- A lote de animais **produces**: every HarvestEvent with its `animalGroupId` (milk, eggs, meat).
- A lote de animais **changes**: every AnimalAdjustment with its `groupId`, signed deltas summing
  from `initialHeadcount` to `headcount`.
- A processing links **inputs to output**: InventoryAdjustments with reason `processing` and
  the same `harvestEventId` are the lots that were consumed; that HarvestEvent is the output.
- A slaughter links **heads to meat**: AnimalAdjustment reason `slaughter` with
  `harvestEventId` → the meat HarvestEvent → its Lot.

Units: `kg, g, unit (unid), dozen (dz), bunch (maço), liter (L), ml, box (cx), bag (saco)`.
Statuses for lots: fresh / expiring soon (≤ 3 days) / expired, with the `harvest-*` tokens.

Seeded examples (dev only): categories Ovos 🥚, Laticínios 🧀, Carnes 🥩, Mel 🍯 (type
`animal`); products Leite (L, 3 days), Queijo Minas (kg, 30), Ovos Caipiras (dz, 21), Frango
Caipira (kg, 3), Mel (kg, 365); lots "Vacas em lactação" (6 bovinos) and "Galinhas poedeiras"
(28 aves).

## 4. What the user must be able to do

Each capability lists where it lives today, what the user does, the rules the design must
surface, and the feedback. "Status" says how finished the current UI is.

### 4.1 Products of animal origin

| | |
| --- | --- |
| Where | Produtos page (`/cultures`), tab **Produtos**; form dialog "Novo Produto" / "Editar Produto" |
| Do | Create a product in an animal category (Ovos, Laticínios, Carnes, Mel) with default unit (now including **dz**), shelf life in days, price per unit, favorite, notes. Same form as plant products. |
| Rules | Name and category required. Categories are seeded; there is **no UI to create categories** (type `custom` exists in the model). |
| Status | Works. Category filter chips include the four animal categories with their emoji. |

### 4.2 Animal lots

| | |
| --- | --- |
| Where | Produtos page, tab **Lotes de Animais** (`/cultures?tab=animals`); FAB → "Lotes de Animais" |
| Do | **List** lots: species icon, name, "N cabeças", zone name, badge "Encerrado" when 0 heads. **Create** (header "Novo Lote" or empty-state button): nome, espécie, cabeças iniciais, zona ou pasto (only if zones exist), início do lote (date), observações. **View** a lot (bottom sheet): species, cabeças, início, notes, button "Ajustar Cabeças", and **Histórico** of adjustments ("dd/MM · Motivo · +3 / −2", notes). **Edit** name, species, zone, start date, notes (not headcount). **Delete** with confirmation ("Excluir lote de animais?" / "A produção já registrada continua no estoque."). |
| Rules | Name required (inline error). Initial headcount is a non-negative integer (inline error "Quantidade inválida"). Start date ≤ today (inline error "A data não pode ser no futuro"). A lot with 0 heads is "Encerrado" but stays listed and can still receive heads. Deleting removes the lot and its history; production it made stays in stock. |
| Feedback | Toasts: "Lote de animais criado / atualizado". |
| Status | Works, minimal. List is flat, unsorted beyond name, no grouping by species, no filter for closed lots, no production shown in the detail sheet (see §9). |

### 4.3 Adjust heads

| | |
| --- | --- |
| Where | Lot detail sheet → "Ajustar Cabeças" (dialog "Ajustar Lote de Animais") |
| Do | Toggle **Remover / Adicionar**; enter an integer count; pick a **Motivo**: removing → Morte, Venda, Abate, Correção; adding → Nascimento, Compra, Correção; notes. |
| Rules | Count is a positive integer. When removing, max = current heads (hint "Máximo: N", error "Informe no máximo N"); heads can never go negative (also enforced in data). Switching the toggle resets the reason. |
| Feedback | Toast "Lote de animais ajustado"; headcount and history update live. |
| Status | Works. Dialog is a vertical form; on short phones it scrolls. |

### 4.4 Slaughter with meat output

| | |
| --- | --- |
| Where | Same dialog, reason **Abate** |
| Do | A section "Registrar produto do abate" appears: **Produto** (select, only products in animal categories, default "Sem produto") and **Quantidade produzida** with the product's unit (e.g. "(kg)"). |
| Rules | Output is optional (home consumption is legitimate); once a product is chosen, quantity > 0 is required. Saving records the head removal **and** a production event for the meat, linked to the lot and inheriting the lot's zone; the meat enters stock as a lot with the product's shelf life. |
| Feedback | Toast "Lote de animais ajustado". The meat appears in Estoque and in Home → Produção Recente. |
| Status | Works. The link slaughter → meat lot is stored but not displayed anywhere yet. |

### 4.5 Log production from a lot (milking, eggs)

| | |
| --- | --- |
| Where | FAB → "Registrar Produção" (`/harvest/new`), three steps: **Escolha o Produto → Quantidade → Detalhes** |
| Do | Step 1: pick the product (favorites, recent, search, full list). Step 2: the quantity dial (big number, − / +, quick-add +0,5 +1 +5 +10, unit select, variedade select if any). Step 3: data (date, default today, max today), **Zona** (if zones exist), **Lote de animais** (only when the product's category type is `animal`; options are lots with heads > 0; "Sem lote de animais" default), observações. "Concluído" saves. |
| Rules | Quantity > 0. Date ≤ today. Animal lot is optional. Saving creates a HarvestEvent with `animalGroupId` and a stock lot with expiry = date + shelf life. |
| Feedback | Toast "Produção registrada!" with "10 L Leite"; navigates Home. |
| Status | Works. The animal-lot field is a plain select at the bottom of step 3; nothing on step 1 or 2 hints that a lot can be attributed. |

### 4.6 Stock of animal products and processing

| | |
| --- | --- |
| Where | Estoque (`/inventory`), card per product/variety with lots; "Ajustar" per lot (dialog "Ajustar Quantidade"); also FAB → "Ajustar Estoque" (`/inventory/adjust`, lot picker) |
| Do | Milk, eggs, cheese, meat appear as ordinary stock with expiry badges. Adjust a lot: Remover / Adicionar, quantity, **Motivo** (Vendido, Consumido, Dano, Perda, Presente, Correção, **Processamento**), notes. With **Processamento**: the dialog switches to product-wide mode: "Quantidade atual" shows the total of that product in that unit, hint "Consome primeiro os lotes com validade mais próxima. Disponível: 10 L", and two fields appear: **Produto resultante** (any product) and **Quantidade produzida** with its unit. |
| Rules | Processing only removes (hidden when adding). Max = total of the product **in the same unit** across all its lots; consumption is FIFO by expiry, the user does not pick lots. Output product and quantity > 0 required. Result: input lots debited with reason Processamento, a new production event and stock lot for the output, all linked. |
| Feedback | Toast "Processamento registrado"; Estoque refreshes. |
| Status | Works. Processing is hidden inside a reason dropdown; users will not discover it (see §9). |

### 4.7 Zones and pastures

| | |
| --- | --- |
| Where | Configurações (`/settings`) → card **Zonas e Pastos** |
| Do | List zones; add by name (inline form, "Adicionar Zona"); delete with confirmation ("Excluir zona?" / "Registros que usam esta zona continuam salvos."). |
| Rules | Name required (button disabled when empty). No rename, no reorder, no duplicate check. Zones appear ordered by creation in the wizard and in the lot form. |
| Feedback | Toast "Zona adicionada". |
| Status | Works, minimal. |

### 4.8 Downstream, unchanged flows that now carry animal products

- **Home**: "Produção Recente" lists milk/eggs/meat with the duplicate action; "Vencendo em
  Breve" includes milk (3-day shelf life makes it frequent); quick stats count all products.
- **Disponibilidade**: the WhatsApp message lists animal products with price per unit and an
  emoji picked from the name (🥛 leite, 🥚 ovo, 🧀 queijo, 🥩 carne, 🍗 frango, 🍯 mel, 🧈
  manteiga). Items can be excluded or have quantity edited before copying.
- **Exportar Dados**: full export now includes `animal-groups` and `animal-adjustments`
  (JSON + CSV). Settings → Gerenciamento de Dados, unchanged UI.
- **Aparência**: Settings has a Sistema / Claro / Escuro override (added in the same branch).

## 5. Screen inventory

Existing screens touched (keep their jobs, improve freely within DESIGN.md):

| Route | Screen | Livestock-related elements |
| --- | --- | --- |
| `/` | Início | Produção Recente rows, Vencendo em Breve, stats |
| `/cultures` | Produtos | Tabs Produtos / Lotes de Animais; header button changes per tab ("Novo Produto" / "Novo Lote"); category chips incl. animal categories |
| `/cultures?tab=animals` | Lotes de Animais (tab) | List, empty state, detail sheet, lot form dialog, adjust dialog with slaughter section, delete alert |
| `/harvest/new` | Registrar Produção | Step 3 "Detalhes": Zona, Lote de animais |
| `/inventory` | Estoque | Cards; adjust dialog with Processamento mode |
| `/inventory/adjust` | Ajustar Estoque | Lot picker → same dialog |
| `/settings` | Configurações | Cards: Informações do Sítio, Aparência, Zonas e Pastos, Gerenciamento de Dados, Sobre |
| FAB (all tabs) | Ações Rápidas drawer | Registrar Produção, Ajustar Estoque, Adicionar Produto, Lotes de Animais, Configurar Disponibilidade |

No new routes exist yet. If you propose new screens (e.g. a lot detail page instead of a
sheet, a processing flow of its own), say which route and entry point they get; the bottom
navigation has two tabs (Início, Estoque) plus the center FAB and must stay that way.

## 6. States to design for every screen

- **Empty**: no animal lots ("Nenhum lote de animais" + hint + "Novo Lote"); no zones; no
  products in an animal category; no history on a lot; no stock of a product when processing.
- **Loading**: skeleton rows (two cards) while live queries resolve.
- **Error**: inline, next to the field, in `destructive` text with `aria-live`; toasts
  "Não foi possível salvar. Tente novamente." for failed writes.
- **Edge**: lot with 0 heads (Encerrado); product with no price (no "R$" shown); very long lot
  or product names (truncate with ellipsis, never wrap the badges); 200 % text size; dark mode;
  a slaughter without output; processing when only one lot exists; a lot whose zone was deleted
  (zone simply not shown).

## 7. Rules the design must make visible

1. Heads are integers and never negative. The max when removing is the current headcount.
2. Processing works on the **product**, not the tapped lot; the hint must say the oldest lots
   go first and show the available total in the right unit.
3. Output quantity always shows the unit of the **output** product; input quantity shows the
   unit of the input.
4. A slaughter may or may not register meat; when it does, that meat is ordinary stock.
5. Dates default to today and cannot be in the future; stored as local noon to avoid timezone
   drift.
6. Status is never color alone: expiry badges carry text; closed lots carry the word
   "Encerrado".
7. One sheet or dialog at a time: the detail sheet closes before the edit or adjust dialog
   opens.
8. Every select with an optional value has an explicit "Sem …" option (Sem zona, Sem lote de
   animais, Sem produto).

## 8. Copy already available (pt-BR; en exists for each)

Use these keys or propose edits; do not invent parallel strings.

```text
crops.title Produtos · crops.tabProducts Produtos · crops.tabAnimals Lotes de Animais · crops.addCrop Novo Produto
actions.animalLots Lotes de Animais · actions.animalLotsDesc Cabeças, nascimentos, vendas e abates
actions.logHarvest Registrar Produção · actions.logHarvestDesc Colheita, ordenha, ovos ou abate
actions.addCrop Adicionar Produto · actions.addZone Adicionar Zona

animals.title Lotes de Animais · animals.lot Lote de animais · animals.newLot Novo Lote · animals.editLot Editar Lote de Animais
animals.name Nome do lote · animals.namePlaceholder Ex: Vacas em lactação · animals.species Espécie
animals.speciesNames: cattle Bovinos · poultry Aves · swine Suínos · goat Caprinos · sheep Ovinos · bees Abelhas · fish Peixes · other Outros
animals.headcount Cabeças · {{count}} cabeça(s) (plural forms incl. "0 cabeças") · animals.initialHeadcount Cabeças iniciais
animals.zone Zona ou pasto · animals.noZone Sem zona · animals.startedAt Início do lote
animals.notes Observações · animals.notesPlaceholder Raça, origem, manejo...
animals.empty Nenhum lote de animais · animals.emptyHint Cadastre um lote para registrar ordenha, ovos ou abate · animals.closed Encerrado
animals.adjust Ajustar Cabeças · animals.adjustTitle Ajustar Lote de Animais · animals.currentHeadcount Cabeças atuais
animals.maxRemove Máximo: {{max}} · animals.exceedsHeadcount Informe no máximo {{max}}
animals.reasons: birth Nascimento · purchase Compra · death Morte · sale Venda · slaughter Abate · correction Correção
animals.slaughterOutput Registrar produto do abate · animals.outputProduct Produto · animals.noOutput Sem produto · animals.outputQuantity Quantidade produzida
animals.created Lote de animais criado · animals.updated Lote de animais atualizado · animals.adjusted Lote de animais ajustado
animals.deleteLot Excluir lote de animais? · animals.deleteLotDesc A produção já registrada continua no estoque.
animals.history Histórico · animals.noHistory Nenhum ajuste registrado

harvest.title Registrar Produção · harvest.stepCrop Escolha o Produto · harvest.stepQuantity Quantidade · harvest.stepContext Detalhes
harvest.animalLot Lote de animais · harvest.noAnimalLot Sem lote de animais · harvest.notesPlaceholder Notas sobre a produção...

inventory.reasons.processing Processamento · inventory.processed Processamento registrado
inventory.processing.outputProduct Produto resultante · inventory.processing.selectProduct Selecione o produto
inventory.processing.outputQuantity Quantidade produzida
inventory.processing.fifoHint Consome primeiro os lotes com validade mais próxima. Disponível: {{max}} {{unit}}

settings.zones Zonas e Pastos · settings.zonesHint Usadas na produção e nos lotes de animais · settings.zoneName Nome da zona
settings.zoneNamePlaceholder Ex: Pasto do fundo · settings.zonesEmpty Nenhuma zona cadastrada · settings.zoneAdded Zona adicionada
settings.deleteZone Excluir zona? · settings.deleteZoneDesc Registros que usam esta zona continuam salvos. · settings.deleteZoneNamed Excluir zona {{name}}

units.dozen dz · errors.futureDate A data não pode ser no futuro · errors.invalidQuantity Quantidade inválida
```

Writing rules (DESIGN.md §9): Title Case for screen titles and button labels, sentence case
for body and hints, verbs on buttons, errors say what to do next, no "Oops", no "we".

## 9. Design opportunities (data exists, no UI yet)

Ranked by value to the farmer. Each is optional; say which you take.

1. **Production of a lot.** The detail sheet shows adjustments but not what the lot produced.
   Data: HarvestEvents with `animalGroupId`. A "Produção" section (last entries, totals per
   product for the week/month) would make "how much are the cows giving" answerable.
2. **Discoverable processing.** Processamento is a reason buried in a dropdown. A visible
   action ("Processar" on the product card in Estoque, or a FAB action) with the same fields
   would make leite → queijo a first-class flow.
3. **Traceability views.** For a cheese lot: which milk lots went in (adjustments with its
   `harvestEventId`). For a meat lot: which animal lot and slaughter. For milk: which lot.
   Currently nowhere. Could live in a lot detail sheet in Estoque (there is none today; the
   lot buttons open the adjust dialog directly).
4. **Lot list structure.** Group or filter by species; hide or collapse closed lots; show a
   small production summary per row (e.g. "12 L hoje").
5. **Step 3 of the wizard** for animal products: the Lote de animais field could be promoted
   above zone, or pre-selected when only one lot of the species exists, or remembered from the
   last production of that product.
6. **Slaughter yield.** Show heads removed and kg produced together in history ("−2 Abate ·
   3,4 kg Frango Caipira").
7. **Zones.** Rename and reorder; show which lots and how much production each zone has.
8. **Dates.** Currently `dd/MM` and `dd/MM/yyyy`; a locale-aware helper is planned.
9. **Tablet width.** Everything is centered at 512 px; a two-column layout for list + detail
   is open.

## 10. Deliberately out of scope

Do not design for these unless the owner asks: individual animals and ear tags, health and
vaccination records, weighing and weight gain, reproduction and lactation cycles, pasture
rotation planning, feed and cost tracking, manual selection of which lots a processing
consumes (FIFO is the rule), creation of custom categories.

## 11. Constraints for the designer

- Components: shadcn set in `src/components/ui/` (Button, Card, Badge, Dialog, Drawer, Tabs,
  Select, Switch, Input, Textarea, Label, AlertDialog, ToggleGroup, …). Icons: lucide only;
  species icons today: Beef (bovinos), Bird (aves), Ham (suínos), Bug (abelhas), Fish (peixes),
  PawPrint (caprinos, ovinos, outros). Emoji only in user content and the WhatsApp message.
- Dialogs scroll inside themselves on short phones; bottom sheets (Drawer) have a grabber,
  swipe to dismiss and a close button; one modal at a time.
- Controls 44 × 44 px; icon-only controls need a text label; every form field has a label;
  numeric keyboard for heads, decimal for quantities.
- Tokens only (`primary`, `muted`, `destructive`, `harvest-success/warning/expired`,
  `whatsapp`); no raw palette colors. Contrast ≥ 4.5:1 in both appearances.
- Bottom navigation stays: Início · FAB · Estoque. New top-level destinations go through
  the FAB drawer or as tabs inside Produtos.

## 12. Where to look in the code

| File | What |
| --- | --- |
| `src/domain/contracts/types.ts` | All entities and enums |
| `src/data/repositories/animalRepository.ts` | Lot CRUD, adjust, slaughter output |
| `src/data/repositories/harvestRepository.ts` | Production events, `createFromProcessing` |
| `src/domain/rules/processing.ts` | FIFO rule |
| `src/components/animals/AnimalLots.tsx` | List, detail sheet, lot form, adjust dialog |
| `src/pages/CulturesPage.tsx` | Produtos page with tabs |
| `src/components/inventory/AdjustmentDialog.tsx` | Stock adjustment incl. Processamento |
| `src/pages/HarvestWizardPage.tsx`, `src/components/harvest/ContextInput.tsx` | Wizard step 3 |
| `src/pages/SettingsPage.tsx` | Zones card, appearance |
| `src/components/layout/FABMenu.tsx` | Quick actions |
| `src/i18n/locales/pt-BR.json` | All copy |
| `docs/katubaya-typed-data-contract.md` §2.4b, §5.9–5.10 | Export contract for livestock |
| `docs/glossary.md` | Terms incl. "Animal lot" and "Processing" |
