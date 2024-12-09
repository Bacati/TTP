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
	  pvl: 399,
	  vforce: 199,
	  admiMost: 51,
	  potMost70: 289,
	  potTxtV8: 401,
	  potTxtV21:459,
	  carbu32: 129,
	  viloItal: 229,
	  viloItal44: 250,
	},
  ];
  export const general70 = {
	viloItal: 229,
	carbu32: 129,
	roulementMost: 28,
	pvl: 399,
	embrayageMost: 50,
	vforce: 199,
	admiMost: 51,
	potTxtV8: 401,
  };
  export const general80 = {
	viloItal44: 250,
	carbu32: 129,
	roulementMost: 28,
	pvl: 399,
	embrayageMost: 50,
	vforce: 199,
	admiMost: 51,
	potTxtV8: 401,
  };
  export const general90 = {
	carbu32: 129,
	roulementMost: 28,
	pvl: 399,
	embrayageMost: 50,
	vforce: 199,
	admiMost: 51,
	potTxtV21: 459,
  };

  export const clearPot = [
	{
		nettoyant: 7.99
	}
  ]
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
  export const compet50Doppler = [
	{
		cylindre: 249,
		vilo: 129,
	},
  ];
  export const compet50Mhr = [
	{
		cylindre: 407,
		vilo: 129,
	},
  ]
  export const compet50Wr = [
	{
		cylindre: 417,
		vilo: 280,
		pot: 440,
	},
  ]
  export const compet70Fast = [
	{
		cylindre: 492,
	},
  ]
  export const compet70Wr = [
	{
		cylindre: 384,
	},
  ]
  export const compet70ProRace = [
	{
		cylindre: 302,
	},
  ]
  export const compet78xtrem = [
	{
		cylindre: 265,
	},
  ]
  export const compet78mhr = [
	{
		cylindre: 398,
	},
  ]
  export const compet78most = [
	{
		cylindre: 249,
	},
  ]
  export const compet80fast = [
	{
		cylindre: 499,
	},
  ]
  export const compet80wr = [
	{
		cylindre: 419,
	},
  ]
  export const compet90wr = [
	{
		cylindre: 481,
		viloItal44: 250,
	},
  ]
  export const compet90fast = [
	{
		cylindre: 520,
		viloItal44: 250,
	},
  ]
  export const compet100fast = [
	{
		cylindre: 520,
		vilo: 476
	}	
  ]
  export const compet96bida = [
	{
		cylindre: 481,
		vilo: 350
	}	
  ]
  export const mcAdelin = [
	{
		maitre: 10
	}
  ]

  const calculateTotalPrice = (specificParts: any, generalParts70: any = {}, generalParts80: any = {}, generalParts90: any = {}, generalParts: any, additionalParts: string[] = []) => {
    let total = 0;
    // Additionner les valeurs spécifiques
    for (const part of Object.values(specificParts)) {
        total += part;
    }
    if (Object.keys(generalParts70).length > 0) {
        for (const part of Object.values(generalParts70)) {
            total += part;
        }
    }
	if (Object.keys(generalParts80).length > 0) {
        for (const part of Object.values(generalParts80)) {
            total += part;
        }
    }
	if (Object.keys(generalParts90).length > 0) {
        for (const part of Object.values(generalParts90)) {
            total += part;
        }
    }
    // Additionner les valeurs supplémentaires
    for (const part of additionalParts) {
        total += generalParts[part] || 0;
    }

    return total;
};

  const PrixAllMk = () => {
	const specific = all50Mk[0];
	const generalParts = general[0];

	return calculateTotalPrice(specific, {}, {}, {}, generalParts, ['pot']);
  };

  const PrixAllTop = () => {
	const specific = all70top[0];
	const generalParts = general[0];

	return calculateTotalPrice(specific, {}, {}, {}, generalParts, ['pot', 'roulement', 'embrayage', 'pipe', 'carbu']);
  };

  const PrixAllAirsal = () => {
	const specific = all70airsal[0];
	const generalParts = general[0];

	return calculateTotalPrice(specific, {}, {}, {}, generalParts, ['pot', 'roulement', 'embrayage', 'pipe', 'carbu']);
  };

  const PrixAllAirsalAlu = () => {
	const specific = all70airsalAlu[0];
	const generalParts = general[0];

	return calculateTotalPrice(specific, {}, {}, {}, generalParts, ['potVoca', 'roulement', 'embrayageMost', 'lamelleFibre', 'pipe', 'carbu24']);
  };

  const PrixAllTopRose = () => {
	const specific = all75TopRose[0];
	const generalParts = general[0];

	return calculateTotalPrice(specific, {}, {}, {}, generalParts, ['potVoca', 'roulement', 'embrayageMost', 'clapetVl6', 'pipe', 'carbu24']);
  };
  const PrixAll78Airsal = () => {
	const specific = all78Airsal[0];
	const generalParts = general[0];

	return calculateTotalPrice(specific, {}, {}, {}, generalParts, ['potVoca', 'roulement', 'embrayageMost', 'lamelleCarbonne', 'pipe', 'carbu24']);
  };
  const PrixAll78Brk = () => {
	const specific = all78brk[0];
	const generalParts = general[0];

	return calculateTotalPrice(specific, {}, {}, {}, generalParts, ['potMost80', 'embrayageMost', 'carbu24', 'mvtdd', 'roulementMost', 'admiItalkit']);
  };
  const PrixAllTopAlu = () => {
	const specific = allTopalu[0];
	const generalParts = general[0];

	return calculateTotalPrice(specific, {}, {}, {}, generalParts, ['carbu24']);
  };
  const PrixAll78Most = () => {
	const specific = all78Most[0];
	const generalParts = general[0];

	return calculateTotalPrice(specific, {}, {}, {}, generalParts, ['carbu24', 'potMost80', 'embrayageMost', 'mvtdd', 'roulementMost', 'admiItalkit']);
  };
  const PrixClear = () => {
	const specific = clearPot[0];

	return calculateTotalPrice(specific, {}, {}, {}, {})
  }
  const PrixCompetDoppler = () => {
	const specific = compet50Doppler[0];
	const generalParts = general[0];
	return calculateTotalPrice(specific, {}, {}, {}, generalParts, ['carbu24', 'roulementMost', 'pvl', 'embrayageMost', 'vforce', 'admiMost', 'potMost70' ])
  }
  const PrixCompet50Mhr = () => {
	const specific = compet50Mhr[0];
	const generalParts = general[0];
	return calculateTotalPrice(specific, {}, {}, {}, generalParts, ['carbu24', 'roulementMost', 'pvl', 'embrayageMost', 'vforce', 'admiMost', 'potMost70' ])
  }
  const PrixCompet50Wr = () => {
	const specific = compet50Wr[0];
	const generalParts = general[0];
	return calculateTotalPrice(specific, {}, {}, {}, generalParts, ['carbu24', 'roulementMost', 'pvl', 'embrayageMost', 'vforce', 'admiMost' ])
  }
  const PrixCompet70Fast = () => {
	const specific = compet70Fast[0];
	return calculateTotalPrice(specific, general70, {}, {}, {},)
  }
  const PrixCompet70Wr = () => {
	const specific = compet70Wr[0];
	return calculateTotalPrice(specific, general70, {}, {}, {})
  }
  const PrixCompet70ProRace = () => {
	const specific = compet70ProRace[0];
	return calculateTotalPrice(specific, general70, {}, {}, {})
  }
  const PrixCompet78xtrem = () => {
	const specific = compet78xtrem[0];
	return calculateTotalPrice(specific, general70, {}, {}, {})
  }
  const PrixCompet78mhr = () => {
	const specific = compet78mhr[0];
	return calculateTotalPrice(specific, general70, {}, {}, {})
  }
  const PrixCompet78most = () => {
	const specific = compet78most[0];
	return calculateTotalPrice(specific, general70, {}, {}, {})
  }
  const PrixCompet80fast = () => {
	const specific = compet80fast[0];
	return calculateTotalPrice(specific, {}, general80, {}, {})
  }
  const PrixCompet80wr = () => {
	const specific = compet80wr[0];
	return calculateTotalPrice(specific, {}, general80, {}, {})
  }
  const PrixCompet90wr = () => {
	const specific = compet90wr[0];
	return calculateTotalPrice(specific, {}, general90, {}, {})
  }
  const PrixCompet90fast = () => {
	const specific = compet90fast[0];
	return calculateTotalPrice(specific, {}, general90, {}, {})
  }
  const PrixCompet100fast = () => {
	const specific = compet100fast[0];
	return calculateTotalPrice(specific, {}, general90, {}, {})
  }
  const PrixCompet96bida = () => {
	const specific = compet96bida[0];
	return calculateTotalPrice(specific, {}, general90, {}, {})
  }
  const PrixMcAdelin = () => {
	const specific = mcAdelin[0];

	return calculateTotalPrice(specific, {}, {}, {}, {})
  }

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
	  clearPot : PrixClear(),
	  compet50Doppler : PrixCompetDoppler(),
	  compet50Mhr : PrixCompet50Mhr(),
	  compet50Wr : PrixCompet50Wr(),
	  compet70Fast : PrixCompet70Fast(),
	  compet70Wr : PrixCompet70Wr(),
	  compet70ProRace : PrixCompet70ProRace(),
	  compet78xtrem : PrixCompet78xtrem(),
	  compet78mhr : PrixCompet78mhr(),
	  compet78most : PrixCompet78most(),
	  compet80fast : PrixCompet80fast(),
	  compet80wr : PrixCompet80wr(),
	  compet90wr : PrixCompet90wr(),
	  compet90fast : PrixCompet90fast(),
	  compet100fast : PrixCompet100fast(),
	  compet96bida : PrixCompet96bida(),
	  mcAdelin : PrixMcAdelin(),
	},
  ];
