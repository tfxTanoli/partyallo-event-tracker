import { Event, PackingItem } from '../types';

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-SG', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function formatTime(timeStr: string): string {
  if (!timeStr) return '';
  const [h, m] = timeStr.split(':');
  const hour = parseInt(h, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${m} ${ampm}`;
}

export function formatTimestamp(isoStr: string): string {
  if (!isoStr) return '';
  const date = new Date(isoStr);
  return date.toLocaleString('en-SG', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function getEventProgress(event: Event): { packed: number; loaded: number; total: number } {
  const packable = event.packingList.filter((i) => i.isToPack);
  const packed = packable.filter((i) => i.isPacked).length;
  const loaded = packable.filter((i) => i.isLoaded).length;
  return { packed, loaded, total: packable.length };
}

export function getStationProgress(
  items: PackingItem[],
  stationName: string
): { packed: number; loaded: number; total: number } {
  const stationItems = items.filter((i) => i.stationName === stationName && i.isToPack);
  return {
    packed: stationItems.filter((i) => i.isPacked).length,
    loaded: stationItems.filter((i) => i.isLoaded).length,
    total: stationItems.length,
  };
}

export function calculateQty(item: PackingItem, servings: number): number {
  if (item.isFixed) return item.baseQty;
  return Math.ceil((item.baseQty * servings) / 100);
}

export function getStatusColor(status: string): string {
  const map: Record<string, string> = {
    Planning: '#0284c7',
    Packing: '#7c3aed',
    'In progress': '#d97706',
    Completed: '#059669',
  };
  return map[status] || '#64748b';
}

export function groupItemsByCategory(items: PackingItem[]): Record<string, PackingItem[]> {
  return items.reduce<Record<string, PackingItem[]>>((acc, item) => {
    const key = item.category;
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});
}

export function getDaysUntilEvent(dateStr: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const eventDate = new Date(dateStr);
  eventDate.setHours(0, 0, 0, 0);
  const diff = eventDate.getTime() - today.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function truncateText(text: string, maxLen: number): string {
  return text.length > maxLen ? text.slice(0, maxLen - 1) + '…' : text;
}
