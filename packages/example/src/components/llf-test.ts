import m from 'mithril';
import { LayoutForm, Form, SlimdownView, IObject } from 'mithril-ui-form';
import { TextArea } from 'mithril-materialized';

export interface IContext {
  admin: boolean;
}

/** Relevant context for the Form, can be used with show/disabling */
const context = {
  admin: true,
};

interface IEditor {
  name: string;
  role: string;
  region: string;
  country: string;
}
interface ISource {
  title: string;
  url: string;
}

interface ILessonLearned {
  id: string;
  event: string;
  /** GeoJSON area definition */
  area: { [key: string]: any };
  description: string;
  categories: string[]; // TODO Allow the user to specify defaults
  created: Date;
  edited: Date;
  editors: IEditor[];
  sources?: ISource[];
}

const countries = [
  {
    id: 'n_a',
    label: 'N/A',
  },
  {
    id: 'austria',
    label: 'Austria',
  },
  {
    id: 'belgium',
    label: 'Belgium',
  },
  {
    id: 'bulgaria',
    label: 'Bulgaria',
  },
  {
    id: 'croatia',
    label: 'Croatia',
  },
  {
    id: 'cyprus',
    label: 'Cyprus',
  },
  {
    id: 'czech_republic',
    label: 'Czech Republic',
  },
  {
    id: 'denmark',
    label: 'Denmark',
  },
  {
    id: 'estonia',
    label: 'Estonia',
  },
  {
    id: 'finland',
    label: 'Finland',
  },
  {
    id: 'france',
    label: 'France',
  },
  {
    id: 'germany',
    label: 'Germany',
  },
  {
    id: 'greece',
    label: 'Greece',
  },
  {
    id: 'hungary',
    label: 'Hungary',
  },
  {
    id: 'ireland',
    label: 'Ireland',
  },
  {
    id: 'italy',
    label: 'Italy',
  },
  {
    id: 'latvia',
    label: 'Latvia',
  },
  {
    id: 'lithuania',
    label: 'Lithuania',
  },
  {
    id: 'luxembourg',
    label: 'Luxembourg',
  },
  {
    id: 'malta',
    label: 'Malta',
  },
  {
    id: 'netherlands',
    label: 'Netherlands',
  },
  {
    id: 'poland',
    label: 'Poland',
  },
  {
    id: 'portugal',
    label: 'Portugal',
  },
  {
    id: 'romania',
    label: 'Romania',
  },
  {
    id: 'slovakia',
    label: 'Slovakia',
  },
  {
    id: 'slovenia',
    label: 'Slovenia',
  },
  {
    id: 'spain',
    label: 'Spain',
  },
  {
    id: 'sweden',
    label: 'Sweden',
  },
  {
    id: 'united_kingdom',
    label: 'United Kingdom',
  },
];

const languages = [
  {
    id: 'en',
    label: 'English',
  },
  {
    id: 'de',
    label: 'German',
  },
  {
    id: 'fr',
    label: 'French',
  },
  {
    id: 'other',
    label: 'Other',
  },
];

const incidentTypes = [
  {
    id: 'earthquake',
    label: 'Earthquake',
    show: ['applicability = general', 'applicability = natural', 'applicability = nattech'],
  },
  {
    id: 'eruption',
    label: 'Volcanic eruption',
    show: ['applicability = general', 'applicability = natural', 'applicability = nattech'],
  },
  {
    id: 'movement',
    label: 'Mass movement',
    show: ['applicability = general', 'applicability = natural', 'applicability = nattech'],
  },
  {
    id: 'storm',
    label: 'Storm',
    show: ['applicability = general', 'applicability = natural', 'applicability = nattech'],
  },
  {
    id: 'tornado',
    label: 'Tornado',
    show: ['applicability = general', 'applicability = natural', 'applicability = nattech'],
  },
  {
    id: 'cold',
    label: 'Extreme cold',
    show: ['applicability = general', 'applicability = natural', 'applicability = nattech'],
  },
  {
    id: 'heat',
    label: 'Extreme heat',
    show: ['applicability = general', 'applicability = natural', 'applicability = nattech'],
  },
  {
    id: 'drought',
    label: 'Drought',
    show: ['applicability = general', 'applicability = natural', 'applicability = nattech'],
  },
  {
    id: 'wildfire',
    label: 'Wildfire',
    show: ['applicability = general', 'applicability = natural', 'applicability = nattech'],
  },
  {
    id: 'river',
    label: 'River flood',
    show: ['applicability = general', 'applicability = natural', 'applicability = nattech'],
  },
  {
    id: 'flash',
    label: 'Flash flood',
    show: ['applicability = general', 'applicability = natural', 'applicability = nattech'],
  },
  {
    id: 'coastal',
    label: 'Coastal flood',
    show: ['applicability = general', 'applicability = natural', 'applicability = nattech'],
  },
  {
    id: 'landslide',
    label: 'Landslide',
    show: ['applicability = general', 'applicability = natural', 'applicability = nattech'],
  },
  {
    id: 'epidemics',
    label: 'Epidemics / Pandemics',
    show: [
      'applicability = general',
      'applicability = natural',
      'applicability = nattech',
      'applicability = intentional',
    ],
  },
  {
    id: 'infestation',
    label: 'Insect infestation',
    show: [
      'applicability = general',
      'applicability = natural',
      'applicability = nattech',
      'applicability = intentional',
    ],
  },
  {
    id: 'animal',
    label: 'Animal stampede',
    show: [
      'applicability = general',
      'applicability = natural',
      'applicability = nattech',
      'applicability = intentional',
    ],
  },
  {
    id: 'asteroids',
    label: 'Asteroids',
    show: ['applicability = general', 'applicability = natural', 'applicability = nattech'],
  },
  {
    id: 'meteoroids',
    label: 'Meteoroids / Comets',
    show: ['applicability = general', 'applicability = natural', 'applicability = nattech'],
  },
  {
    id: 'chemical',
    label: 'Chemical spill',
    show: [
      'applicability = general',
      'applicability = technological',
      'applicability = nattech',
      'applicability = intentional',
    ],
  },
  {
    id: 'explosion',
    label: 'Explosion',
    show: [
      'applicability = general',
      'applicability = technological',
      'applicability = nattech',
      'applicability = intentional',
    ],
  },
  {
    id: 'fire',
    label: 'Fire',
  },
  {
    id: 'gas',
    label: 'Gas leak',
  },
  {
    id: 'nuclear',
    label: 'Nuclear accident',
    show: [
      'applicability = general',
      'applicability = technological',
      'applicability = nattech',
      'applicability = intentional',
    ],
  },
  {
    id: 'aircrash',
    label: 'Air crash',
    show: [
      'applicability = general',
      'applicability = technological',
      'applicability = nattech',
      'applicability = intentional',
    ],
  },
  {
    id: 'roadaccident',
    label: 'Road accident',
    show: [
      'applicability = general',
      'applicability = technological',
      'applicability = nattech',
      'applicability = intentional',
    ],
  },
  {
    id: 'railaccident',
    label: 'Rail accident',
    show: [
      'applicability = general',
      'applicability = technological',
      'applicability = nattech',
      'applicability = intentional',
    ],
  },
  {
    id: 'wateraccident',
    label: 'Accident on water',
    show: [
      'applicability = general',
      'applicability = natural',
      'applicability = technological',
      'applicability = nattech',
      'applicability = intentional',
    ],
  },
  {
    id: 'infra',
    label: 'Collapse of infra',
    show: [
      'applicability = general',
      'applicability = technological',
      'applicability = nattech',
      'applicability = intentional',
    ],
  },
  {
    id: 'drinkingwater',
    label: 'Drinking water failure',
    show: [
      'applicability = general',
      'applicability = technological',
      'applicability = nattech',
      'applicability = intentional',
    ],
  },
  {
    id: 'energy_failure',
    label: 'Energy failure',
    show: [
      'applicability = general',
      'applicability = technological',
      'applicability = nattech',
      'applicability = intentional',
    ],
  },
  {
    id: 'ict_failure',
    label: 'Telecom/ICT failure',
    show: [
      'applicability = general',
      'applicability = technological',
      'applicability = nattech',
      'applicability = intentional',
    ],
  },
  {
    id: 'bomb',
    label: 'Bomb attack',
    show: [
      'applicability = general',
      'applicability = technological',
      'applicability = nattech',
      'applicability = intentional',
    ],
  },
  {
    id: 'cbrn',
    label: 'CBRN attack',
    show: [
      'applicability = general',
      'applicability = technological',
      'applicability = nattech',
      'applicability = intentional',
    ],
  },
  {
    id: 'cyber_attack',
    label: 'Cyber attack',
    show: [
      'applicability = general',
      'applicability = technological',
      'applicability = nattech',
      'applicability = intentional',
    ],
  },
  {
    id: 'cyber_crime',
    label: 'Cyber crime',
    show: [
      'applicability = general',
      'applicability = technological',
      'applicability = nattech',
      'applicability = intentional',
    ],
  },
];

const cips = [
  {
    id: 'drinking_water',
    label: 'Drinking water',
  },
  {
    id: 'electricity',
    label: 'Electricity',
  },
  {
    id: 'gas_supply',
    label: 'Gas supply',
  },
  {
    id: 'public_health',
    label: 'Public Health',
  },
  {
    id: 'telecom_ict',
    label: 'Telecom/ICT',
  },
  {
    id: 'transport_air',
    label: 'Transport - Air',
  },
  {
    id: 'transport_rail',
    label: 'Transport - Rail',
  },
  {
    id: 'transport_rivers',
    label: 'Transport - Rivers',
  },
  {
    id: 'transport_sea',
    label: 'Transport - Sea',
  },
  {
    id: 'water_management',
    label: 'Water management',
  },
  {
    id: 'other',
    label: 'Other',
  },
];

const impactLevels = [
  {
    id: 'unknown',
    label: 'Unknown',
  },
  {
    id: 'veryHigh',
    label: 'Very high',
  },
  {
    id: 'high',
    label: 'High',
  },
  {
    id: 'neutral',
    label: 'Neutral',
  },
  {
    id: 'limited',
    label: 'Limited',
  },
  {
    id: 'veryLimited',
    label: 'Very limited',
  },
];

const qualityLevels = [
  {
    id: 'unknown',
    label: 'Unknown',
  },
  {
    id: 'very_poor',
    label: 'Very poor',
  },
  {
    id: 'poor',
    label: 'Poor',
  },
  {
    id: 'neutral',
    label: 'Neutral',
  },
  {
    id: 'good',
    label: 'Good',
  },
  {
    id: 'very_good',
    label: 'Very good',
  },
];

const improvementLevels = [
  {
    id: 'unknown',
    label: 'Unknown',
  },
  {
    id: 'none',
    label: 'None',
  },
  {
    id: 'limited',
    label: 'Limited',
  },
  {
    id: 'moderate',
    label: 'Moderate',
  },
  {
    id: 'considerable',
    label: 'Considerable',
  },
  {
    id: 'very_high',
    label: 'Very high',
  },
];

const costLevels = [
  {
    id: 'unknown',
    label: 'Unknown',
  },
  {
    id: 'less_then_100000',
    label: 'Less then 100.000',
  },
  {
    id: 'between_100_200_thousand',
    label: '100 - 200 thousand',
  },
  {
    id: 'between_200_500_thousand',
    label: '200 - 500 thousand',
  },
  {
    id: 'more_than_half_million',
    label: '0,5 - 1 million',
  },
  {
    id: 'one_to_two_million',
    label: '1 - 2 million',
  },
  {
    id: 'two_to_five_million',
    label: '2 - 5 million',
  },
  {
    id: 'five_to_ten_million',
    label: '5 - 10 million',
  },
  {
    id: 'more_then_10_million',
    label: 'More then 10 million',
  },
];

const templateInfo = {
  author: 'Dirk Stolk',
  created: '2018-10-23',
  version: 'v0.0.1',
  tableOfContent: 'Table of Content',
  and: 'and',
  docInfoTitle: 'Document info',
  authorLabel: 'Author',
  releaseLabel: 'Comments',
  versionLabel: 'Version',
  createdLabel: 'Created on',
  updatedLabel: 'Updated on',
  nextLabel: 'Next',
  prevLabel: 'Previous',
  showTemplateSelector: true,
};

const source = [
  {
    id: 'title',
    label: 'English title',
    type: 'text',
    required: true,
    icon: 'title',
    className: 'col s6',
  },
  {
    id: 'orgTitle',
    label: 'Original title (if applicable)',
    type: 'text',
    icon: 'title',
    className: 'col s6',
  },
  { id: 'author', type: 'text', label: 'First author and/or organisation', icon: 'person', className: 'col s6' },
  { id: 'yearOfPublication', type: 'number', min: 1900, max: 2100, label: 'Year of publication', className: 'col s3' },
  { id: 'language', label: 'Language', type: 'select', value: 'en', options: languages, className: 'col s3' },
  { id: 'url', label: 'Link', type: 'url', icon: 'link', className: 'col s6' },
  {
    id: 'dissemination',
    required: true,
    label: 'Dissemination level',
    // type: 'select',
    className: 'col s3',
    options: [
      {
        id: 'public',
        label: 'Public',
      },
      {
        id: 'restricted',
        label: 'Restricted',
      },
      {
        id: 'secret',
        label: 'Secret',
      },
    ],
  },
  {
    id: 'otherLanguage',
    label: 'Other language',
    type: 'text',
    show: 'language = other',
    options: languages,
    className: 'col s3',
  },
] as Form;

const info = [
  { id: 'intake', type: 'section' },
  {
    type: 'md',
    value: `### DRIVER+ Lessons Learned Framework

This questionnaire allows you to capture the lessons that you've learned while dealing with an incident or after running a specific event or trial.

#### Intake

_Fields marked with a <span style='color: red;'>*</span> are mandatory._
`,
  },
  {
    id: 'event',
    label: 'Title of the evaluated event',
    description: '_Short name to indicate the event and its evaluation (max. 70 characters)._',
    type: 'text',
    maxLength: 70,
    required: true,
    className: 'col s8',
  },
  { id: 'id', type: 'text', disabled: true, autogenerate: 'guid', required: true, className: 'col s4' },
  { id: 'editors', type: 'section' },
  {
    id: 'editors',
    label: 'Editors',
    className: 'col s12',
    repeat: true,
    type: [
      {
        id: 'name',
        label: 'Name',
        type: 'text',
        className: 'col s8',
        iconName: 'title',
        required: true,
        description: '_Name of the editor or analist._',
      },
      { id: 'organisation', type: 'text', className: 'col s4' },
      { id: 'country', type: 'select', options: countries, className: 'col s6' },
      { id: 'lastEdit', label: 'Last edit on', type: 'date', className: 'col s6' },
    ],
  },
  {
    id: 'info',
    label: 'Additional info',
    type: 'textarea',
    maxLength: 500,
    description: `_Free space for additional notes by the evaluators (max. 4 lines / 400 characters)._`,
  },
  { id: 'created', label: 'Created "{{event}}" event on:', type: 'date', required: true },
  { id: 'edited', type: 'date', required: true },
  { type: 'md', value: '#### Sources of information' },
  { id: 'sources', type: 'section' },
  {
    id: 'sources',
    label: 'Publications',
    repeat: true,
    type: source,
  },
  {
    id: 'multimedia',
    label: 'Multimedia sources',
    repeat: true,
    type: [
      { id: 'desc', label: 'Short description', type: 'textarea' },
      { id: 'owner', label: 'Owner', type: 'text', className: 'col s6' },
      { id: 'url', label: 'Link', type: 'url', icon: 'link', className: 'col s6' },
    ],
  },
  { id: 'event', label: 'Description of the event', type: 'section' },
  { type: 'md', value: '#### General description of the event' },
  {
    id: 'eventType',
    type: 'select',
    placeholder: 'Pick an option',
    className: 'col s12 m6',
    options: [
      { id: 'risk', label: 'Risk analysis' },
      { id: 'action', label: 'Preventive action' },
      { id: 'incident' },
      { id: 'disaster' },
      { id: 'training' },
      { id: 'excercise' },
      { id: 'test' },
    ],
  },
  {
    id: 'eventPhase',
    type: 'select',
    label: 'Concerned phase of the disaster management cycle:',
    className: 'col s12 m6',
    options: [
      {
        id: 'risk_assessment',
        label: 'Risk assessment',
      },
      {
        id: 'mi',
        label: 'Mitigation & Prevention',
      },
      {
        id: 'preparedness',
        label: 'Preparedness',
      },
      {
        id: 'response',
        label: 'Response',
      },
      {
        id: 'recovery',
        label: 'Recovery',
      },
    ],
  },
  {
    id: 'startDate',
    type: 'date',
    label: 'Start date of the event',
    className: 'col s12 m6',
  },
  {
    id: 'endDate',
    type: 'date',
    label: 'End date of the event',
    className: 'col s12 m6',
  },
  { id: 'location', type: 'map', className: 'col s12' },
  {
    id: 'areaType',
    type: 'select',
    label: 'Type of area:',
    className: 'col s6 m3',
    options: [
      {
        id: 'mixed',
        label: 'Mixed',
      },
      {
        id: 'centre',
        label: 'City/town centre',
      },
      {
        id: 'residential',
        label: 'Residential area',
      },
      {
        id: 'industrial',
        label: 'Industrial area',
      },
      {
        id: 'countryside',
        label: 'Countryside',
      },
      {
        id: 'water',
        label: 'Water',
      },
    ],
  },
  {
    id: 'incidentCategory',
    label: 'Incident category',
    className: 'col s6 m3',
    options: [
      {
        id: 'general',
        label: 'Incidents in general',
      },
      {
        id: 'natural',
        label: 'Natural incidents',
      },
      {
        id: 'technological',
        label: 'Technological incidents',
      },
      {
        id: 'nattech',
        label: 'Natural and Technological incidents',
      },
      {
        id: 'attacks',
        label: 'Intentional incidents / Attacks',
      },
    ],
  },
  {
    id: 'incidentType',
    label: 'Select all the incident types that apply:',
    checkboxClass: 'col s12 m6 l4',
    type: 'options',
    options: [
      {
        id: 'earthquake',
        label: 'Earthquake',
      },
      {
        id: 'eruption',
        label: 'Volcanic eruption',
      },
      {
        id: 'movement',
        label: 'Mass movement',
      },
      {
        id: 'storm',
        label: 'Storm',
      },
      {
        id: 'tornado',
        label: 'Tornado',
      },
      {
        id: 'cold',
        label: 'Extreme cold',
      },
      {
        id: 'heat',
        label: 'Extreme heat',
      },
      {
        id: 'drought',
        label: 'Drought',
      },
      {
        id: 'wildfire',
        label: 'Wildfire',
      },
      {
        id: 'river',
        label: 'River flood',
      },
      {
        id: 'flash',
        label: 'Flash flood',
      },
      {
        id: 'coastal',
        label: 'Coastal flood',
      },
      {
        id: 'landslide',
        label: 'Landslide',
      },
      {
        id: 'epidemics',
        label: 'Epidemics/Pandemics',
      },
      {
        id: 'infestation',
        label: 'Insect infestation',
      },
      {
        id: 'animal',
        label: 'Animal stampede',
      },
      {
        id: 'asteroids',
        label: 'Asteroids',
      },
      {
        id: 'meteoroids',
        label: 'Meteoroids / Comets',
      },
      {
        id: 'chemical',
        label: 'Chemical spill',
      },
      {
        id: 'explosion',
        label: 'Explosion',
      },
      {
        id: 'fire',
        label: 'Fire',
      },
      {
        id: 'gas',
        label: 'Gas leak',
      },
      {
        id: 'nuclear',
        label: 'Nuclear accident',
      },
      {
        id: 'aircrash',
        label: 'Air crash',
      },
      {
        id: 'roadaccident',
        label: 'Road accident',
      },
      {
        id: 'railaccident',
        label: 'Rail accident',
      },
      {
        id: 'wateraccident',
        label: 'Accident on water',
      },
      {
        id: 'infra',
        label: 'Collapse of infra',
      },
      {
        id: 'drinkingwater',
        label: 'Drinking water failure',
      },
      {
        id: 'energy_failure',
        label: 'Energy failure',
      },
      {
        id: 'ict_failure',
        label: 'Telecom/ICT failure',
      },
      {
        id: 'bomb',
        label: 'Bomb attack',
      },
      {
        id: 'cbrn',
        label: 'CBRN attack',
      },
      {
        id: 'cyber_attack',
        label: 'Cyber attack',
      },
      {
        id: 'cyber_crime',
        label: 'Cyber crime',
      },
    ],
  },
  {
    id: 'eventInfo',
    label: 'Additional info',
    type: 'textarea',
    maxLength: 400,
  },
  { id: 'geo', type: 'section', label: 'Geographic scale' },
  { type: 'md', value: '#### Geographical scale of the event' },
  {
    id: 'geo',
    label: 'Inside and/or outside the EU',
    type: 'select',
    className: 'col s6 m4',
    options: [
      {
        id: 'inside',
        label: 'Inside EU',
      },
      {
        id: 'inside_outside',
        label: 'Inside and outside EU',
      },
      {
        id: 'europe',
        label: 'Elsewhere in Europe',
      },
      {
        id: 'outside',
        label: 'Outside Europe',
      },
    ],
  },
  {
    id: 'international',
    label: 'International dimension',
    type: 'select',
    className: 'col s6 m4',
    options: [
      {
        id: 'one_country',
        label: 'One country',
      },
      {
        id: 'bi_tri',
        label: 'Bi/Tri national',
      },
      {
        id: 'multi',
        label: 'Multi-national',
      },
      {
        id: 'pan_eu',
        label: 'Pan EU',
      },
      {
        id: 'european',
        label: 'European',
      },
      {
        id: 'extern_europe',
        label: 'Extern Europe',
      },
      {
        id: 'worldwide',
        label: 'Worldwide',
      },
    ],
  },
  {
    id: 'scale',
    label: 'Scale',
    type: 'select',
    className: 'col s6 m4',
    options: [
      {
        id: 'regional',
        label: 'Regional',
      },
      {
        id: 'national',
        label: 'National',
      },
      {
        id: 'pan_europe',
        label: 'Pan-Europe',
      },
      {
        id: 'global',
        label: 'Global',
      },
    ],
  },
  {
    id: 'scaleExplanation',
    label: 'Brief explanation',
    type: 'textarea',
  },
  {
    id: 'members',
    repeat: true,
    label: 'Involved EU member state',
    type: [{ id: 'country', type: 'select', className: 'col s6', options: countries }],
  },
  {
    id: 'memberInfo',
    label: 'Additional info',
    type: 'textarea',
  },
  {
    id: 'cip',
    label: 'Involved critical infrastructure',
    type: 'options',
    break: true,
    checkboxClass: 'col s6 m4',
    options: [
      {
        id: 'drinkingWater',
        label: 'Drinking water',
      },
      {
        id: 'electricity',
        label: 'Electricity',
      },
      {
        id: 'gasSupply',
        label: 'Gas supply',
      },
      {
        id: 'publicHealth',
        label: 'Public Health',
      },
      {
        id: 'telecomIct',
        label: 'Telecom/ICT',
      },
      {
        id: 'airTransport',
        label: 'Transport - Air',
      },
      {
        id: 'railTransport',
        label: 'Transport - Rail',
      },
      {
        id: 'riverTransportRiver',
        label: 'Transport - Rivers',
      },
      {
        id: 'seaTransport',
        label: 'Transport - Sea',
      },
      {
        id: 'waterManagement',
        label: 'Water management',
      },
      {
        id: 'other',
        label: 'Other',
      },
    ],
  },
  {
    id: 'cipInfo',
    label: 'Brief explanation, if needed',
    type: 'textarea',
  },
  {
    id: 'cipAdditional',
    label: 'Other involved critical infrastructure or societal sectors (if any)',
    type: 'textarea',
  },
  { id: 'organisations', type: 'section', label: 'Organisations' },
  { type: 'md', value: '#### Organisations that were involved in executing CM functions' },
  {
    id: 'organisations',
    label: 'Organisation',
    repeat: true,
    type: [
      {
        id: 'name',
        label: 'Organisation',
        type: 'text',
        className: 'col s12 m4',
      },
      {
        id: 'type',
        label: 'Type of organisation',
        type: 'select',
        className: 'col s12 m4',
        options: [
          {
            id: 'none',
            label: 'Choose one option',
          },
          {
            id: 'fireBrigade',
            label: 'Firebrigade/Civil Prot.',
          },
          {
            id: 'policeMilitary',
            label: 'Police / Military',
          },
          {
            id: 'medicalServices',
            label: 'Medical services',
          },
          {
            id: 'searchAndRescue',
            label: 'Search and Rescue',
          },
          {
            id: 'coastguard',
            label: 'Coastguard',
          },
          {
            id: 'ngoVolunteerOrg.',
            label: 'NGO / Volunteer org.',
          },
          {
            id: 'monitoringInstitutes',
            label: 'Monitoring institutes',
          },
          {
            id: 'publicServices',
            label: 'Public services',
          },
          {
            id: 'criticalInfrastructures',
            label: 'Critical Infrastructures',
          },
          {
            id: 'commandCentres',
            label: 'Command centres',
          },
          {
            id: 'policyAuthorities',
            label: 'Policy / Authorities',
          },
          {
            id: 'internationalAgency',
            label: 'International agency',
          },
          {
            id: 'other',
            label: 'Other',
          },
        ],
      },
      {
        id: 'country',
        label: 'Country of organisation',
        type: 'select',
        className: 'col s12 m4',
        options: countries,
      },
    ],
  },
  {
    id: 'additionalOrganisations',
    label: 'Other involved organisations (if any)',
    type: 'textarea',
  },
  {
    id: 'organisationInvolvement',
    label: 'Evaluated event',
    description: 'Text describing the evaluated event, challenges, problems, roles of the involved organisations:',
    type: 'textarea',
    maxLength: 1000,
  },
  { id: 'lessons', type: 'section', label: 'Lessons' },
  { type: 'md', value: '#### Lessons' },
  {
    id: 'lessons',
    label: 'Lesson',
    repeat: true,
    type: [
      {
        id: 'title',
        type: 'text',
        className: 'col s9',
      },
      {
        id: 'status',
        label: 'Status of the lesson',
        type: 'select',
        className: 'col s3',
        options: [
          {
            id: 'identified',
            label: 'Identified',
          },
          {
            id: 'learned',
            label: 'Learned',
          },
          {
            id: 'implemented',
            label: 'Implemented',
          },
        ],
      },
      {
        id: 'explanation',
        label: 'Explanation of the status',
        type: 'textarea',
        maxLength: 200,
      },
      {
        id: 'futureDev',
        label: 'Future development',
        type: 'textarea',
        newLine: true,
        maxLength: 200,
      },
      {
        id: 'applicability',
        type: 'select',
        label: 'Applicability of the lesson',
        className: 'col s6 m4',
        options: [
          {
            id: 'general',
            label: 'Incidents in general',
          },
          {
            id: 'natural',
            label: 'Natural incidents',
          },
          {
            id: 'technological',
            label: 'Technological incidents',
          },
          {
            id: 'nattech',
            label: 'Natural and Technological incidents',
          },
          {
            id: 'intentional',
            label: 'Intentional incidents / attacks',
          },
        ],
      },
      {
        id: 'scale',
        label: 'Geographical scale of interest',
        type: 'select',
        className: 'col s6 m4',
        options: [
          {
            id: 'regional',
            label: 'Regional',
          },
          {
            id: 'national',
            label: 'National',
          },
          {
            id: 'panEurope',
            label: 'Pan-Europe',
          },
          {
            id: 'global',
            label: 'Global',
          },
        ],
      },
      {
        id: 'incidentTypes',
        label: 'Select all the incident types that apply (up to 4):',
        type: 'select',
        multiple: true,
        newLine: true,
        className: 'col s12 m6 l4',
        options: incidentTypes,
      },
      {
        id: 'cmFunctions',
        type: 'select',
        multiple: true,
        label: 'Applicable Crisis Management functions (up to 4)',
        className: 'col s12',
        options: [
          {
            id: 'risk_assessment',
            label: 'Risk assessment',
          },
          {
            id: 'protection_prevention',
            label: 'Protection/Prevention',
          },
          {
            id: 'contingency_planning',
            label: 'Contingency planning',
          },
          {
            id: 'collaboration_planning',
            label: 'Collaboration planning',
          },
          {
            id: 'education_training',
            label: 'Education & Training',
          },
          {
            id: 'asset_management',
            label: 'Asset management',
          },
          {
            id: 'detection_surveillance',
            label: 'Detection/Surveillance',
          },
          {
            id: 'risk_communication',
            label: 'Risk communication',
          },
          {
            id: 'alerting',
            label: 'Alerting, incl. 112',
          },
          {
            id: 'crisis_communication',
            label: 'Crisis communication',
          },
          {
            id: 'source_fighting',
            label: 'Source fighting',
          },
          {
            id: 'rescue_operations',
            label: 'Rescue operations',
          },
          {
            id: 'law_enforcement',
            label: 'Law enforcement',
          },
          {
            id: 'evacuation_shelter',
            label: 'Evacuation & Shelter',
          },
          {
            id: 'medical_treatment',
            label: 'Medical treatment',
          },
          {
            id: 'clear_incident_area',
            label: 'Clear incident area',
          },
          {
            id: 'basic_needs_supply',
            label: 'Basic needs supply',
          },
          {
            id: 'c4i',
            label: 'C4I',
          },
          {
            id: 'situation_assessment',
            label: 'Situation Assessment',
          },
          {
            id: 'collect_incident_data',
            label: 'Collect incident data',
          },
          {
            id: 'social_media_mining',
            label: 'Social media mining',
          },
          {
            id: 'volunteer_mgt',
            label: 'Volunteer mgt.',
          },
          {
            id: 'logistics',
            label: 'Logistics',
          },
          {
            id: 'humanitarian_recovery',
            label: 'Humanitarian recovery',
          },
          {
            id: 'environment_recovery',
            label: 'Environment recovery',
          },
          {
            id: 'infrastr',
            label: 'Re-establish infrastr.',
          },
        ],
      },
      {
        id: 'cmSectors',
        type: 'select',
        multiple: true,
        label: 'Applicable Crisis Management sectors (up to 4)',
        className: 'col s12',
        options: [
          {
            id: 'firebrigade',
            label: 'Firebrigade/Civil Prot.',
          },
          {
            id: 'police_military',
            label: 'Police / Military',
          },
          {
            id: 'medical_services',
            label: 'Medical services',
          },
          {
            id: 'search_and_rescue',
            label: 'Search and Rescue',
          },
          {
            id: 'coastguard',
            label: 'Coastguard',
          },
          {
            id: 'ngo_volunteer_org.',
            label: 'NGO / Volunteer org.',
          },
          {
            id: 'monitoring_institutes',
            label: 'Monitoring institutes',
          },
          {
            id: 'public_services',
            label: 'Public services',
          },
          {
            id: 'critical_infrastructures',
            label: 'Critical Infrastructures',
          },
          {
            id: 'command_centres',
            label: 'Command centres',
          },
          {
            id: 'policy_authorities',
            label: 'Policy / Authorities',
          },
          {
            id: 'international_agency',
            label: 'International agency',
          },
          {
            id: 'other',
            label: 'Other',
          },
        ],
      },
      {
        id: 'cips',
        type: 'select',
        multiple: true,
        label: 'Applicable Critical Infrastructures (up to 4)',
        className: 'col s12',
        options: cips,
      },
      {
        id: 'interests',
        type: 'select',
        multiple: true,
        label: 'Aspects of interest (up to 4)',
        className: 'col s6 m3',
        options: [
          {
            id: 'personnel',
            label: 'Personnel',
          },
          {
            id: 'equipment/tools',
            label: 'Equipment/Tools',
          },
          {
            id: 'ict',
            label: 'ICT',
          },
          {
            id: 'fixed assets',
            label: 'Fixed assets',
          },
          {
            id: 'organisation',
            label: 'Organisation',
          },
          {
            id: 'procedures',
            label: 'Procedures',
          },
        ],
      },
      {
        id: 'observationBrief',
        type: 'textarea',
        label: 'Short description of the underlying observations',
        description: '_Describe the observation that leads/has led to the lesson._',
        maxLength: 300,
      },
      {
        id: 'observationDetails',
        type: 'textarea',
        label: 'Detailed description of the underlying observations',
        description: '_Describe the observation in detail that leads/has led to the lesson._',
        maxLength: 1000,
      },
      {
        type: 'md',
        value: 'Performance of the Crisis Management function',
      },
      {
        id: 'logistics',
        label: 'Logistics',
        type: 'select',
        className: 'col s6 m3 l2',
        options: qualityLevels,
      },
      {
        id: 'sourceFighting',
        type: 'select',
        label: 'Source fighting',
        className: 'col s6 m3 l2',
        options: qualityLevels,
      },
      {
        id: 'volunteers',
        label: 'Volunteer management',
        type: 'select',
        className: 'col s6 m3 l2',
        options: qualityLevels,
      },
      {
        type: 'md',
        label: 'Societal impact of incidents',
      },
      {
        id: 'victims',
        type: 'select',
        label: 'Numbers of victims/casualties',
        className: 'col s6 m4 l3',
        options: impactLevels,
      },
      {
        id: 'materialDamage',
        type: 'select',
        label: 'Material damage',
        className: 'col s6 m4 l3',
        options: impactLevels,
      },
      {
        id: 'ci_loss',
        type: 'select',
        label: 'Loss of (critical) infrastructure services',
        className: 'col s6 m4 l3',
        options: impactLevels,
      },
      {
        id: 'soc_eco_disruption',
        label: 'Social / Economical disruption',
        type: 'select',
        className: 'col s6 m4 l3',
        options: impactLevels,
      },
      {
        id: 'environmental_degradation',
        label: 'Environmental degradation',
        type: 'select',
        className: 'col s6 m4 l3',
        options: impactLevels,
      },
      {
        type: 'md',
        label: '##### Other consequences',
      },
      {
        id: 'responderHealtAndSafety',
        label: 'Responder health and safety',
        type: 'select',
        className: 'col s6 m4 l3',
        options: qualityLevels,
      },
      {
        id: 'respondersExplanation',
        label: 'Explanation',
        type: 'textarea',
        maxLength: 150,
        className: 'col s6 m8 l9',
      },
      {
        id: 'costs',
        label: 'Costs concerned CM functions',
        type: 'select',
        className: 'col s6 m4 l3',
        options: impactLevels,
      },
      {
        id: 'costs',
        label: 'Absolute costs',
        className: 'col s6 m4 l3',
        type: 'select',
        options: costLevels,
      },
      {
        id: 'costsExplanation',
        label: 'Explanation of costs',
        type: 'textarea',
        maxLength: 120,
        className: 'col s12 m4 l6',
      },
      {
        type: 'md',
        label: '##### Lesson, including its potential expected effect',
      },
      {
        id: 'lessonBriefDescription',
        label: 'Brief description of the lesson',
        type: 'textarea',
        maxLength: 300,
      },
      {
        id: 'lessonDetailedDescription',
        label: 'Detailed description of the lesson',
        type: 'textarea',
        maxLength: 1000,
      },
      {
        type: 'md',
        label: `##### Performance of the Crisis Management function

        _Estimated or expected potential impact of the lesson once implemented._`,
      },
      {
        id: 'logistics_improvements',
        label: 'Logistics',
        className: 'col s6 m3 l2',
        options: improvementLevels,
      },
      {
        id: 'source_fighting_improvements',
        label: 'Source fighting',
        className: 'col s6 m3 l2',
        options: improvementLevels,
      },
      {
        id: 'volunteers_improvements',
        label: 'Volunteer management',
        className: 'col s6 m3 l2',
        options: improvementLevels,
      },
      { type: 'md', label: '##### Societal impact of incidents' },
      {
        id: 'victimsImprovements',
        label: 'Numbers of victims/casualties',
        className: 'col s6 m3 l2',
        options: improvementLevels,
      },
      {
        id: 'materialDamageImprovements',
        label: 'Material damage',
        className: 'col s6 m3 l2',
        options: improvementLevels,
      },
      {
        id: 'ciLossImprovements',
        label: 'Loss of (critical) infrastructure services',
        className: 'col s6 m3 l2',
        options: improvementLevels,
      },
      {
        id: 'socEcoDisruptionImprovements',
        label: 'Social / Economic disruption',
        className: 'col s6 m3 l2',
        options: improvementLevels,
      },
      {
        id: 'environmentalDegradationImprovements',
        label: 'Environmental degradation',
        className: 'col s6 m3 l2',
        options: improvementLevels,
      },
      {
        type: 'md',
        label: '##### Other consequences',
      },
      {
        id: 'responderHealthAndSafetyIimprovements',
        type: 'select',
        label: 'Responder health and safety',
        className: 'col s6 m3 l2',
        options: improvementLevels,
      },
      {
        id: 'respondersImprovements',
        label: 'Explanation',
        type: 'textarea',
        maxLength: 150,
        className: 'col s6 m8 l9',
      },
      {
        id: 'costsImprovements',
        label: 'Costs concerned CM functions',
        className: 'col s6 m3 l2',
        options: improvementLevels,
      },
      {
        id: 'costsImprovementsExplanation',
        label: 'Explanation',
        type: 'textarea',
        maxLength: 120,
        className: 'col s6 m8 l9',
      },
    ],
  },
] as Form;

export const LLFView = () => {
  const state = {
    result: {} as ILessonLearned,
    isValid: false,
    form: [] as Form,
    error: '',
  };

  const print = (isValid: boolean) => {
    state.isValid = isValid;
    console.log(`Form is valid: ${isValid}`);
    console.log(JSON.stringify(state.result, null, 2));
  };

  state.form = info;

  state.result = {} as ILessonLearned;

  return {
    view: () => {
      const { result, form } = state;

      return m('.row', [
        // m('.col.s6.l4', [
        //   m(SlimdownView, {
        //     md: `### JSON FORM

        //   Feel free to edit me.`,
        //   }),
        //   m(TextArea, {
        //     label: 'JSON form',
        //     initialValue: JSON.stringify(form, null, 2),
        //     onchange: (value: string) => (state.form = JSON.parse(value)),
        //   }),
        //   state.error ? m('p', m('em.red', state.error)) : undefined,
        // ]),
        // m('.col.s12', m(LayoutForm, { form, obj: result, onchange: print, context, section: 'geo' })),
        m('.col.s12', m(LayoutForm, { form, obj: result, onchange: print, context })),
      ]);
    },
  };
};
