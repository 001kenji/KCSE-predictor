# Subject-specific keywords for topic identification
TOPIC_KEYWORDS = {
    'MATH': {
        # Form 1 Topics
        'natural_numbers': ['natural numbers', 'counting numbers', 'whole numbers', 'number line', 'place value'],
        'factors': ['factors', 'multiples', 'prime numbers', 'prime factors', 'divisibility'],
        'divisibility': ['divisibility', 'divisible by', 'divisibility rules'],
        'gcd_lcm': ['gcd', 'hcf', 'lcm', 'greatest common divisor', 'highest common factor', 'least common multiple'],
        'integers': ['integers', 'negative numbers', 'positive numbers', 'number line'],
        'fractions': ['fractions', 'numerator', 'denominator', 'proper fraction', 'improper fraction', 'mixed number'],
        'decimals': ['decimals', 'decimal places', 'decimal point', 'recurring decimals'],
        'squares': ['squares', 'square numbers', 'perfect squares', 'square roots'],
        'algebraic_expressions': ['algebraic expressions', 'variables', 'coefficients', 'terms', 'like terms'],
        'rates_ratios': ['rates', 'ratios', 'proportion', 'direct proportion', 'inverse proportion'],
        'percentages': ['percentages', 'percentage increase', 'percentage decrease', 'profit', 'loss'],
        'length': ['length', 'perimeter', 'distance', 'units of length'],
        'area': ['area', 'square units', 'rectangle area', 'triangle area', 'circle area'],
        'volume': ['volume', 'capacity', 'cubic units', 'prism volume', 'cylinder volume'],
        'mass_weight': ['mass', 'weight', 'kilograms', 'grams', 'tonnes'],
        'time': ['time', '24-hour clock', '12-hour clock', 'speed', 'distance-time graphs'],
        
        # Form 2 Topics
        'cubes': ['cubes', 'cube roots', 'perfect cubes'],
        'reciprocals': ['reciprocals', 'multiplicative inverse'],
        'indices': ['indices', 'exponents', 'laws of indices', 'power', 'exponential'],
        'logarithms': ['logarithms', 'logs', 'log tables', 'characteristic', 'mantissa'],
        'approximation': ['approximation', 'rounding off', 'significant figures', 'decimal places'],
        'commercial_arithmetic': ['simple interest', 'compound interest', 'hire purchase', 'commission', 'discount'],
        'coordinates': ['coordinates', 'cartesian plane', 'x-axis', 'y-axis', 'plotting points'],
        'angles': ['angles', 'acute angle', 'obtuse angle', 'reflex angle', 'angle properties'],
        'scale_drawing': ['scale drawing', 'map ratio', 'scale factor', 'enlargement'],
        'common_solids': ['prisms', 'pyramids', 'nets', 'surface area', 'volume of solids'],
        
        # Form 3 Topics
        'quadratic_expressions': ['quadratic expressions', 'factorization', 'perfect square', 'difference of squares'],
        'quadratic_equations': ['quadratic equations', 'solve quadratic', 'quadratic formula', 'completing the square'],
        'linear_inequalities': ['inequalities', 'linear inequalities', 'number line', 'solution set'],
        'commercial_arithmetic_2': ['income tax', 'value added tax', 'vat', 'payslip', 'pension'],
        'circles_chords': ['chords', 'perpendicular bisector', 'radius perpendicular to chord'],
        'matrices': ['matrices', 'matrix', 'determinant', 'inverse matrix', 'identity matrix'],
        'formulae_variation': ['subject of formula', 'direct variation', 'inverse variation', 'joint variation'],
        'binomial_expansion': ['binomial expansion', 'pascal triangle', 'binomial coefficients'],
        'compound_proportions': ['compound proportions', 'mixtures', 'partnership'],
        'graphical_methods': ['graphical methods', 'simultaneous equations', 'linear graphs'],
        'trigonometry': ['trigonometry', 'sine', 'cosine', 'tangent', 'pythagoras theorem'],
        
        # Form 4 Topics
        'vectors': ['vectors', 'column vectors', 'magnitude', 'direction', 'resultant vector'],
        'probability': ['probability', 'sample space', 'tree diagrams', 'mutually exclusive', 'independent events'],
        'statistics': ['statistics', 'mean', 'median', 'mode', 'range', 'quartiles', 'percentiles'],
        'loci': ['loci', 'locus', 'equidistant', 'parallel lines', 'angle bisector'],
        'trigonometry_2': ['sine rule', 'cosine rule', 'area of triangle using sine', 'bearings'],
        'linear_programming': ['linear programming', 'objective function', 'constraints', 'feasible region'],
        'differentiation': ['differentiation', 'derivative', 'gradient function', 'stationary points'],
        'integration': ['integration', 'indefinite integral', 'definite integral', 'area under curve'],
        'area_approximation': ['trapezoidal rule', 'mid-ordinate rule', 'simpson rule', 'area approximation'],
        'sequences_series': ['arithmetic progression', 'geometric progression', 'series', 'sum of terms'],
    },
    'CHEM': {
        # Form 1 Topics
        'introduction_to_chemistry': [
            'chemistry', 'branches of chemistry', 'importance of chemistry',
            'laboratory', 'apparatus', 'safety', 'hazard symbols'
        ],
        'simple_classification_of_substances': [
            'substances', 'pure', 'impure', 'mixtures', 'elements', 'compounds',
            'metals', 'non-metals', 'solutions', 'suspensions', 'colloids',
            'filtration', 'decantation', 'sublimation', 'chromatography'
        ],
        'acids_bases_and_indicators': [
            'acids', 'bases', 'alkalis', 'indicators', 'litmus', 'phenolphthalein',
            'methyl orange', 'universal indicator', 'pH scale', 'neutralization'
        ],
        'air_and_combustion': [
            'air', 'composition', 'oxygen', 'nitrogen', 'combustion', 'rusting',
            'fire extinguishers', 'pollution', 'greenhouse effect'
        ],
        'water_and_hydrogen': [
            'water', 'hydrogen', 'water cycle', 'treatment', 'hard water',
            'softening', 'electrolysis', 'oxidation', 'reduction'
        ],

        # Form 2 Topics
        'structure_of_the_atom_and_periodic_table': [
            'atom', 'subatomic', 'proton', 'neutron', 'electron', 'atomic number',
            'mass number', 'isotopes', 'periodic table', 'groups', 'periods',
            'trends', 'ionization energy', 'electron affinity'
        ],
        'chemical_families': [
            'alkali metals', 'halogens', 'noble gases', 'transition elements',
            'periodicity', 'reactivity', 'valence electrons'
        ],
        'structure_and_bonding': [
            'bonding', 'ionic', 'covalent', 'metallic', 'dot-cross', 'lewis',
            'electronegativity', 'intermolecular forces', 'van der waals',
            'hydrogen bonds'
        ],
        'salts': [
            'salts', 'preparation', 'solubility', 'efflorescence', 'deliquescence',
            'hygroscopy', 'double decomposition', 'precipitation'
        ],
        'effect_of_an_electric_current_on_substances': [
            'electrolysis', 'electrolytes', 'electrodes', 'anode', 'cathode',
            'faraday laws', 'electroplating', 'anodization'
        ],
        'carbon_and_some_of_its_compounds': [
            'carbon', 'allotropes', 'diamond', 'graphite', 'fullerenes',
            'carbon cycle', 'carbon dioxide', 'carbon monoxide'
        ],

        # Form 3 Topics
        'gas_laws': [
            'boyle law', 'charles law', 'pressure law', 'combined gas law',
            'ideal gas equation', 'graham law', 'dalton law'
        ],
        'the_mole': [
            'mole', 'avogadro', 'molar mass', 'molar volume', 'empirical formula',
            'molecular formula', 'stoichiometry', 'concentration'
        ],
        'organic_chemistry_i': [
            'hydrocarbons', 'alkanes', 'alkenes', 'alkynes', 'homologous series',
            'isomerism', 'functional groups', 'nomenclature'
        ],
        'nitrogen_and_its_compounds': [
            'nitrogen', 'ammonia', 'nitric acid', 'nitrates', 'nitrites',
            'nitrogen cycle', 'haber process', 'ostwald process'
        ],
        'sulphur_and_its_compounds': [
            'sulphur', 'sulfur', 'allotropes', 'sulphur dioxide', 'sulphuric acid',
            'contact process', 'environmental effects'
        ],
        'chlorine_and_its_compounds': [
            'chlorine', 'hydrogen chloride', 'bleach', 'water treatment',
            'chlorofluorocarbons', 'ozone depletion'
        ],

        # Form 4 Topics
        'acids_bases_and_salts': [
            'strong acids', 'weak acids', 'strong bases', 'weak bases',
            'buffer solutions', 'titration', 'indicators', 'pH curves',
            'salt hydrolysis'
        ],
        'energy_changes_in_chemical_and_physical_processes': [
            'enthalpy', 'exothermic', 'endothermic', 'hess law',
            'enthalpy diagrams', 'bond energy', 'lattice energy',
            'enthalpy of solution'
        ],
        'reaction_rates_and_reversible_reactions': [
            'reaction rate', 'factors affecting rate', 'catalysts',
            'collision theory', 'activation energy', 'reversible reactions',
            'equilibrium', 'le chatelier principle'
        ],
        'electrochemistry': [
            'electrochemical cells', 'standard electrode potential',
            'electrochemical series', 'corrosion', 'prevention of rusting',
            'batteries', 'fuel cells'
        ],
        'metals': [
            'extraction', 'blast furnace', 'electrolytic extraction',
            'reactivity series', 'uses of metals', 'alloys'
        ],
        'organic_chemistry_ii': [
            'alcohols', 'carboxylic acids', 'esters', 'polymers',
            'soaps', 'detergents', 'fats', 'oils', 'petroleum',
            'fractional distillation', 'cracking'
        ],
        'radioactivity': [
            'radioactivity', 'alpha', 'beta', 'gamma', 'half-life',
            'nuclear reactions', 'uses of radioactivity', 'hazards'
        ]
    }
    # Add more subjects as needed
}