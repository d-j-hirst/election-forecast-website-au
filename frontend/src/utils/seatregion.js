const seatRegions = {
  Adelaide: 'sa',
  Aston: 'vic',
  Ballarat: 'vic',
  Banks: 'nsw',
  Barker: 'sa',
  Barton: 'nsw',
  Bass: 'tas',
  Bean: 'act',
  Bendigo: 'vic',
  Bennelong: 'nsw',
  Berowra: 'nsw',
  Blair: 'qld',
  Blaxland: 'nsw',
  Bonner: 'qld',
  Boothby: 'sa',
  Bowman: 'qld',
  Braddon: 'tas',
  Bradfield: 'nsw',
  Brand: 'wa',
  Brisbane: 'qld',
  Bruce: 'vic',
  Bullwinkel: 'wa',
  Burt: 'wa',
  Calare: 'nsw',
  Calwell: 'vic',
  Canberra: 'act',
  Canning: 'wa',
  Capricornia: 'qld',
  Casey: 'vic',
  Chifley: 'nsw',
  Chisholm: 'vic',
  Clark: 'tas',
  Cook: 'nsw',
  Cooper: 'vic',
  Corangamite: 'vic',
  Corio: 'vic',
  Cowan: 'wa',
  Cowper: 'nsw',
  Cunningham: 'nsw',
  Curtin: 'wa',
  Dawson: 'qld',
  Deakin: 'vic',
  Dickson: 'qld',
  Dobell: 'nsw',
  Dunkley: 'vic',
  Durack: 'wa',
  EdenMonaro: 'nsw',
  Fadden: 'qld',
  Fairfax: 'qld',
  Farrer: 'nsw',
  Fenner: 'act',
  Fisher: 'qld',
  Flinders: 'vic',
  Flynn: 'qld',
  Forde: 'qld',
  Forrest: 'wa',
  Fowler: 'nsw',
  Franklin: 'tas',
  Fraser: 'vic',
  Fremantle: 'wa',
  Gellibrand: 'vic',
  Gilmore: 'nsw',
  Gippsland: 'vic',
  Goldstein: 'vic',
  Gorton: 'vic',
  Grayndler: 'nsw',
  Greenway: 'nsw',
  Grey: 'sa',
  Griffith: 'qld',
  Groom: 'qld',
  Hasluck: 'wa',
  Hawke: 'vic',
  Herbert: 'qld',
  Higgins: 'vic',
  Hindmarsh: 'sa',
  Hinkler: 'qld',
  Holt: 'vic',
  Hotham: 'vic',
  Hughes: 'nsw',
  Hume: 'nsw',
  Hunter: 'nsw',
  Indi: 'vic',
  Isaacs: 'vic',
  Jagajaga: 'vic',
  Kennedy: 'qld',
  KingsfordSmith: 'nsw',
  Kingston: 'sa',
  Kooyong: 'vic',
  LaTrobe: 'vic',
  Lalor: 'vic',
  Leichhardt: 'qld',
  Lilley: 'qld',
  Lindsay: 'nsw',
  Lingiari: 'nt',
  Longman: 'qld',
  Lyne: 'nsw',
  Lyons: 'tas',
  Macarthur: 'nsw',
  Mackellar: 'nsw',
  Macnamara: 'vic',
  Macquarie: 'nsw',
  Makin: 'sa',
  Mallee: 'vic',
  Maranoa: 'qld',
  Maribyrnong: 'vic',
  Mayo: 'sa',
  McEwen: 'vic',
  McMahon: 'nsw',
  McPherson: 'qld',
  Melbourne: 'vic',
  Menzies: 'vic',
  Mitchell: 'nsw',
  Monash: 'vic',
  Moncrieff: 'qld',
  Moore: 'wa',
  Moreton: 'qld',
  NewEngland: 'nsw',
  Newcastle: 'nsw',
  Nicholls: 'vic',
  NorthSydney: 'nsw',
  OConnor: 'wa',
  Oxley: 'qld',
  Page: 'nsw',
  Parkes: 'nsw',
  Parramatta: 'nsw',
  Paterson: 'nsw',
  Pearce: 'wa',
  Perth: 'wa',
  Petrie: 'qld',
  Rankin: 'qld',
  Reid: 'nsw',
  Richmond: 'nsw',
  Riverina: 'nsw',
  Robertson: 'nsw',
  Ryan: 'qld',
  Scullin: 'vic',
  Shortland: 'nsw',
  Solomon: 'nt',
  Spence: 'sa',
  Sturt: 'sa',
  Swan: 'wa',
  Sydney: 'nsw',
  Tangney: 'wa',
  Wannon: 'vic',
  Warringah: 'nsw',
  Watson: 'nsw',
  Wentworth: 'nsw',
  Werriwa: 'nsw',
  Whitlam: 'nsw',
  WideBay: 'qld',
  Wills: 'vic',
  Wright: 'qld',
};

export const seatInRegion = (seatName, regionName) => {
  if (regionName === 'all') return true;
  // depunctuate the name so that it can be easily used as the key in an object literal
  const usedName = seatName.replace(' ', '').replace('-', '').replace("'", '');
  return seatRegions[usedName] === regionName;
};
