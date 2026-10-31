/**
 * Crop Selector Step - Fast selection with recents/favorites
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Star, Clock, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { Crop } from '@/domain/contracts/types';

interface CropSelectorProps {
  recentCrops: Crop[];
  favoriteCrops: Crop[];
  allCrops: Crop[];
  onSelect: (crop: Crop) => void;
  onSearch: (query: string) => Promise<Crop[]>;
}

export function CropSelector({
  recentCrops,
  favoriteCrops,
  allCrops,
  onSelect,
  onSearch,
}: CropSelectorProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Crop[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const timeoutId = setTimeout(async () => {
      const results = await onSearch(searchQuery);
      setSearchResults(results);
      setIsSearching(false);
    }, 150);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, onSearch]);

  const displayCrops = searchQuery.trim() ? searchResults : null;

  return (
    <div className="flex flex-col h-full">
      {/* Search Input */}
      <div className="relative px-4 py-3">
        <Search className="absolute left-7 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          enterKeyHint="search"
          aria-label={t('harvest.searchCrops')}
          placeholder={t('harvest.searchCrops')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') e.currentTarget.blur(); }}
          className="pl-9"
        />
      </div>

      <ScrollArea className="flex-1">
        <div className="px-4 pb-6 space-y-6">
          {/* Search Results */}
          {displayCrops !== null ? (
            <div className="space-y-2">
              {displayCrops.length === 0 ? (
                !isSearching && (
                  <p className="text-center text-muted-foreground py-8">
                    {t('harvest.noResults')}
                  </p>
                )
              ) : (
                displayCrops.map((crop) => (
                  <CropItem key={crop.id} crop={crop} onSelect={onSelect} />
                ))
              )}
            </div>
          ) : (
            <>
              {/* Favorites Section */}
              {favoriteCrops.length > 0 && (
                <section>
                  <div className="flex items-center gap-2 mb-3">
                    <Star className="h-4 w-4 text-primary fill-primary" />
                    <h2 className="text-sm font-medium text-muted-foreground">
                      {t('harvest.favorites')}
                    </h2>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {favoriteCrops.map((crop) => (
                      <button
                        key={crop.id}
                        onClick={() => onSelect(crop)}
                        className={cn(
                          'px-4 py-3 rounded-xl bg-primary/10 border border-primary/20',
                          'font-medium text-primary',
                          'hover:bg-primary/20 active:scale-95 transition-all'
                        )}
                      >
                        {crop.name}
                      </button>
                    ))}
                  </div>
                </section>
              )}

              {/* Recent Section */}
              {recentCrops.length > 0 && (
                <section>
                  <div className="flex items-center gap-2 mb-3">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <h2 className="text-sm font-medium text-muted-foreground">
                      {t('harvest.recent')}
                    </h2>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {recentCrops.map((crop) => (
                      <button
                        key={crop.id}
                        onClick={() => onSelect(crop)}
                        className={cn(
                          'px-4 py-3 rounded-xl bg-muted/50 border border-border',
                          'font-medium',
                          'hover:bg-muted active:scale-95 transition-all'
                        )}
                      >
                        {crop.name}
                      </button>
                    ))}
                  </div>
                </section>
              )}

              {/* All Crops Section */}
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <h2 className="text-sm font-medium text-muted-foreground">
                    {t('harvest.allCrops')}
                  </h2>
                  <Badge variant="secondary" className="text-xs">
                    {allCrops.length}
                  </Badge>
                </div>
                {allCrops.length === 0 ? (
                  <div className="flex flex-col items-center gap-4 py-8">
                    <p className="text-center text-muted-foreground">
                      {t('crops.empty')}
                    </p>
                    <Button variant="outline" onClick={() => navigate('/cultures?new=1')}>
                      {t('actions.addCrop')}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {allCrops.map((crop) => (
                      <CropItem key={crop.id} crop={crop} onSelect={onSelect} />
                    ))}
                  </div>
                )}
              </section>
            </>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

function CropItem({ crop, onSelect }: { crop: Crop; onSelect: (crop: Crop) => void }) {
  const { t } = useTranslation();
  
  return (
    <button
      onClick={() => onSelect(crop)}
      className={cn(
        'w-full flex items-center justify-between p-4 rounded-xl',
        'bg-card border border-border',
        'hover:bg-muted/50 active:scale-[0.98] transition-all'
      )}
    >
      <div className="flex items-center gap-3">
        {crop.isFavorite && <Star className="h-4 w-4 text-primary fill-primary" />}
        <span className="font-medium">{crop.name}</span>
      </div>
      <div className="flex items-center gap-2 text-muted-foreground">
        <span className="text-sm">{t(`units.${crop.defaultUnit}`)}</span>
        <ChevronRight className="h-4 w-4" />
      </div>
    </button>
  );
}
