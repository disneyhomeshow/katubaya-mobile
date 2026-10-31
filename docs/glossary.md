# katubaya Glossary + Domain Language

*A shared vocabulary that keeps the product modular, strongly typed, and easy to extend.*

## Guiding idea

We name concepts the way the field behaves: observable, repeatable, and composable. Every term below should map to a datatype/interface in the codebase and to a section in the export schemas.

---

## Core entities

### Farmer Profile

Minimal identifying info that may be included in exports.

* Fields (suggested): displayName, region, practices (free text), contact (optional)

### Site

A physical location managed by the farmer.

* Notes: A farmer may have multiple sites.

### Zone

A named area within a site used for consistent observation and logging.

* Examples: “North swale”, “Banana line”, “Greenhouse bed 3”
* Purpose: enables patterns over time (microclimates, soil, pests)

### Plot (optional refinement)

A smaller unit within a zone for precision (rows, beds, tree circles).

* Use only if needed; Zones are enough for MVP.

### Crop (Culture)

The catalog item representing what is grown.

* Examples: “Cassava”, “Banana”, “Kale”
* Has a category and default behaviors (units, shelf-life)

### Category

A grouping for crops.

* Examples: Fruit, Leafy Greens, Roots/Tubers, Herbs, Medicinals, Eggs (optional), Honey (optional)

### Cultivar / Breed

A specific variety within a crop.

* Examples: “Banana Prata”, “Tomato Roma”
* May override defaults (shelf-life, preferred unit)

### Unit

A measurement unit used consistently across inventory and availability.

* Examples: kg, bunch, unit, tray, bag
* Strong-typing note: units should be enumerated to avoid “kg/Kg/kilos”.

---

## Harvest + Inventory entities

### Harvest Event

A record of something being harvested at a time and place.

* Fields (typical): id, datetime, cropId, cultivarId (optional), zoneId (optional), quantity, unit, notes, photos (optional)
* Output: creates or increases Inventory Lots.

### Lot

A batch of product that shares harvest context (same crop, same harvest time, similar handling).

* Purpose: enables shelf-life and FIFO reasoning.
* Fields: lotId, cropId, harvestEventId, createdAt, quantityRemaining, unit, expiresAtEstimate

### Animal lot (lote de animais)

A group of animals managed together (species, headcount, optional zone).

* Its headcount changes only through Animal Adjustments (birth, purchase, death, sale, slaughter, correction).
* Production from it (milk, eggs, meat) is a Harvest Event linked to the lot via animalGroupId.
* Not a product Lot: a product Lot is stock; an animal lot is the herd that produces it.

### Shelf-life Rule

A default rule that estimates expiration for a crop/cultivar.

* Example: “Leafy greens: 5 days from harvest (cool storage), 2 days (ambient)”
* MVP: keep simple (single default days); allow future extension to conditions.

### Expiration Estimate

A computed date/time for a lot based on shelf-life rule + harvest time.

* Note: “estimate” is explicit. Reality may vary.

### Inventory

The current state of all lots (or crop totals) at a given moment.

* MVP view: “On hand” per crop, optionally by lot.

### Inventory Adjustment

A manual change applied to inventory to reflect reality.

* Reasons (enum): loss, damage, consumption, gift, sale, correction, processing (optional)
* Fields: id, datetime, lotId or cropId, deltaQuantity, unit, reason, notes
* Strong-typing note: store deltas as signed numbers.

### Processing

Turning stock of one product into another (milk into cheese, pig into cuts).

* Consumes the source product's lots oldest-expiry-first (FIFO) as adjustments with reason processing, and creates a new lot through a Harvest Event of the output product.
* Each consuming adjustment points at that Harvest Event via harvestEventId.

---

## Availability + Export entities

### Availability Window

A time window during which the farmer can deliver or allow pickup.

* Fields: startDateTime, endDateTime, notes (e.g., “pickup mornings only”)

### Availability Item

A line item intended for customers.

* Derived from inventory (and sometimes intention).
* Fields: cropId, cultivarId (optional), availableQty, unit, price (optional for MVP), notes, windowId(s)

### Availability List

A snapshot of availability for a specific period (often “this week”).

* Fields: listId, createdAt, items[], windows[], messageTemplateText

### WhatsApp Template

A generated, copy/paste message string derived from Availability List.

* Includes ordering instructions.
* MVP: text-only, deterministic output.

### Availability Pack

A portable export artifact that can be shared with others or ingested by external tools (future Bridges).

* Contains:

  * manifest (schemaVersion, createdAt, producer info)
  * availability list (structured JSON)
  * CSV exports (items, crops, inventory summary)
  * optional media references (future)

### Manifest

Metadata about an export bundle.

* Fields: schemaVersion, exportedAt, appVersion, deviceId (optional), checksum list (optional), notes
* Optional future: cryptographic signature (not required for MVP, but schema can reserve a field)

### Data Contract / Schema

The versioned definition of exported datatypes.

* Principle: any change is versioned; older exports remain readable.

---

## Ecology “cooperation lens” terms (optional fields, big learning value)

### Guild Function Tag

A functional role within an agroforest.

* Examples (enum/tag set):

  * nitrogenFixer
  * soilBuilder
  * nutrientCycler
  * pollinatorSupport
  * predatorHabitat
  * shadeProvider
  * windbreak
  * groundcover
  * livingMulch
* Used on crops and/or zones.

### Phenology Stage

Observable stage in the plant’s cycle.

* Examples: vegetative, flowering, fruiting, senescent, dormant
* Helps connect yields to seasons and management.

### Signal

A simple observation tied to system health.

* Examples: pestPressureLow/Med/High, diseaseSigns, pollinatorActivityLow/Med/High, waterStress
* Strong-typing note: keep signals enumerated + allow free-text notes.

### Context Snapshot

Minimal “what was true” when something happened.

* Fields: weatherNote, soilMoisture (dry/ok/wet), temperatureNote (optional), moon phase (optional, if culturally relevant)

---

## Event log / audit concepts (for clarity and recovery)

### Event

A timestamped action that changes state (harvest, adjustment, edit, delete).

* Principle: consider append-only events internally to support trust and debugging.

### Snapshot

A materialized view derived from events (inventory totals, latest availability list).

* Makes offline performance easy while preserving history.

---

## UX language (words users will see)

* “Crop” not “SKU”
* “Lot” not “Batch ID” (unless your users prefer “batch”)
* “Lote de animais” for the herd group, never just “lote” (that is a product lot)
* “Zone” not “Location”
* “Adjust” not “Fix”
* “Availability” not “Catalog”
* “Export Pack” not “Sync”

---

## Naming rules (so docs and types stay clean)

* One concept = one name across UI, docs, and code.
* Avoid overloaded words like “item” without prefix: use AvailabilityItem, InventoryItem, etc.
* Enumerations for units, reasons, signals; free text for notes only.
* Version every schema; never break old exports.
