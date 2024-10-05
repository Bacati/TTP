export const general = [
	{
	  roulement: 14,
	  embrayage: 44,
	  pipe: 14,
	  carbu: 105,
	  pot: 212,
	  embrayageMost: 50,
	  lamelleFibre: 10,
	  carbu24: 110,
	  potVoca: 279,
	  clapetVl6: 33,
	  lamelleCarbonne:23,
	  mvtdd:289,
	  potMost80:246,
	  roulementMost:28,
	  admiItalkit: 88,
	},
  ];

  export const all50Mk = [
	{
	  cylindre: 230,
	  carbu: 118,
	},
  ];

  export const all70top = [
	{
	  cylindre: 188,
	  vilo: 105,
	},
  ];

  export const all70airsal = [
	{
	  cylindre: 131,
	  vilo: 77,
	},
  ];

  export const all70airsalAlu = [
	{
	  cylindre: 132,
	  vilo: 128,
	},
  ];

  export const all75TopRose = [
	{
	  cylindre: 289,
	  vilo: 129,
	},
  ];
  export const all78Airsal = [
	{
	  cylindre: 219,
	  vilo: 129,
	},
  ];
  export const all78brk = [
	{
	  cylindre: 257,
	  vilo: 162,
	},
  ];
  export const allTopalu = [
	{
	  pack: 426,
	  embrayage:65,
	  bacTop: 97,
	  pipeMost: 47,
	  pot2win: 329,
	},
  ];
  export const all78Most = [
	{
		cylindre: 249,
	  	vilo:199,
	},
  ];

  const calculateTotalPrice = (specificParts: any, generalParts: any, additionalParts: string[] = []) => {
	let total = 0;
	// Additionner les valeurs spécifiques
	for (const part of Object.values(specificParts)) {
	  total += part;
	}
	// Additionner les valeurs générales
	for (const part of additionalParts) {
	  total += generalParts[part];
	}
	return total;
  };

  const PrixAllMk = () => {
	const specific = all50Mk[0];
	const generalParts = general[0];

	return calculateTotalPrice(specific, generalParts, ['pot']);
  };

  const PrixAllTop = () => {
	const specific = all70top[0];
	const generalParts = general[0];

	return calculateTotalPrice(specific, generalParts, ['pot', 'roulement', 'embrayage', 'pipe', 'carbu']);
  };

  const PrixAllAirsal = () => {
	const specific = all70airsal[0];
	const generalParts = general[0];

	return calculateTotalPrice(specific, generalParts, ['pot', 'roulement', 'embrayage', 'pipe', 'carbu']);
  };

  const PrixAllAirsalAlu = () => {
	const specific = all70airsalAlu[0];
	const generalParts = general[0];

	return calculateTotalPrice(specific, generalParts, ['potVoca', 'roulement', 'embrayageMost', 'lamelleFibre', 'pipe', 'carbu24']);
  };

  const PrixAllTopRose = () => {
	const specific = all75TopRose[0];
	const generalParts = general[0];

	return calculateTotalPrice(specific, generalParts, ['potVoca', 'roulement', 'embrayageMost', 'clapetVl6', 'pipe', 'carbu24']);
  };
  const PrixAll78Airsal = () => {
	const specific = all78Airsal[0];
	const generalParts = general[0];

	return calculateTotalPrice(specific, generalParts, ['potVoca', 'roulement', 'embrayageMost', 'lamelleCarbonne', 'pipe', 'carbu24']);
  };
  const PrixAll78Brk = () => {
	const specific = all78brk[0];
	const generalParts = general[0];

	return calculateTotalPrice(specific, generalParts, ['potMost80', 'embrayageMost', 'carbu24', 'mvtdd', 'roulementMost', 'admiItalkit']);
  };
  const PrixAllTopAlu = () => {
	const specific = allTopalu[0];
	const generalParts = general[0];

	return calculateTotalPrice(specific, generalParts, ['carbu24']);
  };
  const PrixAll78Most = () => {
	const specific = all78Most[0];
	const generalParts = general[0];

	return calculateTotalPrice(specific, generalParts, ['carbu24', 'potMost80', 'embrayageMost', 'mvtdd', 'roulementMost', 'admiItalkit']);
  };
  export const config = [
	{
	  allMk: PrixAllMk(),
	  allTop: PrixAllTop(),
	  allAirsal: PrixAllAirsal(),
	  allAirsalAlu: PrixAllAirsalAlu(),
	  allTopRose: PrixAllTopRose(),
	  all78Airsal: PrixAll78Airsal(),
	  all78brk : PrixAll78Brk(),
	  allTopalu : PrixAllTopAlu(),
	  all78Most : PrixAll78Most(),
	},
  ];
