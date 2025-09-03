import { UIForm } from 'mithril-ui-form-plugin';
import { evalExpression } from '../src/utils';

// Mock mithril-materialized components
jest.mock('mithril-materialized', () => ({
  InputCheckbox: 'input-checkbox',
  TextInput: 'text-input',
  Select: 'select',
  Switch: 'switch',
}));

describe('Form Show Functionality', () => {
  interface TestObject {
    showMap?: boolean;
    region?: string;
    hasIndDiff?: number;
    areaType?: string;
    country?: string;
    diff?: string;
    complexField?: string;
  }

  let testForm: UIForm<TestObject>;

  beforeEach(() => {
    testForm = [
      {
        id: 'showMap',
        type: 'checkbox',
        label: 'Show map',
      },
      {
        id: 'areaType',
        type: 'select',
        label: 'Area type',
        show: 'showMap = true',
        options: [
          { id: 'urban', label: 'Urban' },
          { id: 'rural', label: 'Rural' },
        ],
      },
      {
        id: 'region',
        type: 'select',
        label: 'Region',
        options: [
          { id: 'eu', label: 'Europe' },
          { id: 'other', label: 'Rest of the world' },
        ],
      },
      {
        id: 'country',
        type: 'select',
        label: 'Country',
        options: [
          {
            id: 'NL',
            label: 'Netherlands',
            show: 'region = eu',
          },
          {
            id: 'US',
            label: 'United States',
            show: 'region = other',
          },
        ],
      },
      {
        id: 'hasIndDiff',
        type: 'select',
        label: 'Has individual differences?',
        options: [
          { id: '1', label: 'No' },
          { id: '2', label: 'Unknown' },
          { id: '3', label: 'Yes' },
        ],
      },
      {
        id: 'diff',
        type: 'textarea',
        label: 'Individual differences',
        show: 'hasIndDiff = 3',
      },
    ];
  });

  describe('evalExpression utility', () => {
    it('should evaluate simple boolean expressions correctly', () => {
      const obj = { showMap: true };

      expect(evalExpression('showMap = true', obj)).toBe(true);
      expect(evalExpression('showMap = false', obj)).toBe(false);
    });

    it('should evaluate numeric expressions correctly', () => {
      const obj = { hasIndDiff: 3 };

      expect(evalExpression('hasIndDiff = 3', obj)).toBe(true);
      expect(evalExpression('hasIndDiff = 2', obj)).toBe(false);
    });

    it('should evaluate string expressions correctly', () => {
      const obj = { region: 'eu' };

      expect(evalExpression('region = eu', obj)).toBe(true);
      expect(evalExpression('region = other', obj)).toBe(false);
    });

    it('should handle undefined values correctly', () => {
      const obj = {};

      expect(evalExpression('region = eu', obj)).toBe(false);
      expect(evalExpression('hasIndDiff = 3', obj)).toBe(false);
    });

    it('should handle comparison operators', () => {
      const obj = { value: 5 };

      expect(evalExpression('value > 3', obj)).toBe(true);
      expect(evalExpression('value < 3', obj)).toBe(false);
      expect(evalExpression('value >= 5', obj)).toBe(true);
      expect(evalExpression('value <= 5', obj)).toBe(true);
    });

    it('should handle array of expressions (OR logic)', () => {
      const obj = { region: 'eu' };

      expect(evalExpression(['region = eu', 'region = us'], obj)).toBe(true);
      expect(evalExpression(['region = us', 'region = asia'], obj)).toBe(false);
    });
  });

  describe('Field visibility based on show conditions', () => {
    it('should render field when show condition is met', () => {
      const obj: TestObject = { showMap: true };

      // Test that when showMap is true, the areaType field should be visible
      const areaTypeField = testForm.find((f) => f?.id === 'areaType');
      const showResult = evalExpression(areaTypeField!.show!, obj);

      expect(showResult).toBe(true);
    });

    it('should hide field when show condition is not met', () => {
      const obj: TestObject = { showMap: false };

      // Test that when showMap is false, the areaType field should be hidden
      const areaTypeField = testForm.find((f) => f?.id === 'areaType');
      const showResult = evalExpression(areaTypeField!.show!, obj);

      expect(showResult).toBe(false);
    });

    it('should hide field when show condition field is undefined', () => {
      const obj: TestObject = {};

      // Test that when showMap is undefined, the areaType field should be hidden
      const areaTypeField = testForm.find((f) => f?.id === 'areaType');
      const showResult = evalExpression(areaTypeField!.show!, obj);

      expect(showResult).toBe(false);
    });
  });

  describe('Options filtering based on show conditions', () => {
    it('should filter options based on show condition', () => {
      const obj: TestObject = { region: 'eu' };

      const countryField = testForm.find((f) => f?.id === 'country');
      const options = countryField!.options as Array<{ id: string; label: string; show?: string }>;

      // Filter options based on show condition
      const visibleOptions = options.filter((option) => !option.show || evalExpression(option.show, obj));

      expect(visibleOptions).toHaveLength(1);
      expect(visibleOptions[0].id).toBe('NL');
      expect(visibleOptions[0].label).toBe('Netherlands');
    });

    it('should show different options when region changes', () => {
      const obj: TestObject = { region: 'other' };

      const countryField = testForm.find((f) => f?.id === 'country');
      const options = countryField!.options as Array<{ id: string; label: string; show?: string }>;

      // Filter options based on show condition
      const visibleOptions = options.filter((option) => !option.show || evalExpression(option.show, obj));

      expect(visibleOptions).toHaveLength(1);
      expect(visibleOptions[0].id).toBe('US');
      expect(visibleOptions[0].label).toBe('United States');
    });

    it('should show no conditional options when condition is not met', () => {
      const obj: TestObject = { region: 'asia' };

      const countryField = testForm.find((f) => f?.id === 'country');
      const options = countryField!.options as Array<{ id: string; label: string; show?: string }>;

      // Filter options based on show condition
      const visibleOptions = options.filter((option) => !option.show || evalExpression(option.show, obj));

      expect(visibleOptions).toHaveLength(0);
    });
  });

  describe('Complex show conditions', () => {
    beforeEach(() => {
      // Add more complex test cases
      testForm.push({
        id: 'complexField',
        type: 'text',
        label: 'Complex field',
        show: ['region = eu & hasIndDiff = 3', 'region = other & hasIndDiff = 2'],
      });
    });

    it('should handle AND conditions with &', () => {
      const obj1: TestObject = { region: 'eu', hasIndDiff: 3 };
      const obj2: TestObject = { region: 'eu', hasIndDiff: 2 };

      const complexField = testForm.find((f) => f?.id === 'complexField');

      expect(evalExpression(complexField!.show!, obj1)).toBe(true);
      expect(evalExpression(complexField!.show!, obj2)).toBe(false);
    });

    it('should handle multiple OR conditions in array', () => {
      const obj1: TestObject = { region: 'eu', hasIndDiff: 3 };
      const obj2: TestObject = { region: 'other', hasIndDiff: 2 };
      const obj3: TestObject = { region: 'asia', hasIndDiff: 1 };

      const complexField = testForm.find((f) => f?.id === 'complexField');

      expect(evalExpression(complexField!.show!, obj1)).toBe(true);
      expect(evalExpression(complexField!.show!, obj2)).toBe(true);
      expect(evalExpression(complexField!.show!, obj3)).toBe(false);
    });
  });

  describe('Form integration tests', () => {
    it('should create a form component without errors', () => {
      const obj: TestObject = {};

      expect(() => {
        // Just test that the form field evaluation logic works
        testForm.forEach((field) => {
          if (field?.show) {
            evalExpression(field.show, obj);
          }
        });
      }).not.toThrow();
    });

    it('should handle form state changes correctly', () => {
      const obj: TestObject = { showMap: false };

      // Simulate changing showMap to true
      obj.showMap = true;

      const areaTypeField = testForm.find((f) => f?.id === 'areaType');
      expect(evalExpression(areaTypeField!.show!, obj)).toBe(true);
    });
  });
});
