export function formatPrice(price, listingType, { compact = false } = {}) {
  let text;
  if (compact) {
    if (price >= 1_000_000) text = `$${(price / 1_000_000).toFixed(price % 1_000_000 === 0 ? 0 : 2).replace(/0$/, '')}M`;
    else if (price >= 1000) text = `$${Math.round(price / 1000)}K`;
    else text = `$${price}`;
  } else {
    text = `$${price.toLocaleString('en-US')}`;
  }
  return listingType === 'rent' && !compact ? `${text}/mo` : text;
}

export const formatBeds = (beds) => (beds === 0 ? 'Studio' : `${beds} bd`);

export function daysAgo(iso) {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  if (days <= 0) return 'Listed today';
  if (days === 1) return 'Listed yesterday';
  return `Listed ${days} days ago`;
}
