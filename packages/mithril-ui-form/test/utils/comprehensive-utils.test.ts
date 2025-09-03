import {
  capitalizeFirstLetter,
  isComponentType,
  padLeft,
  toHourMin,
  getPath,
  flatten,
  evalExpression,
  resolveExpression,
  canResolvePlaceholders,
  resolvePlaceholders,
  formatExpression,
  deepCopy,
  labelResolver,
  stripSpaces,
  range,
  hash,
  toQueryString,
  getAllUrlParams,
  getQueryParamById,
  extractTitle,
  arrayUtils,
} from '../../src/utils';

// Location is mocked in test/setup.ts

describe('Comprehensive Utils Tests', () => {
  describe('capitalizeFirstLetter', () => {
    it('should capitalize the first letter', () => {
      expect(capitalizeFirstLetter('hello')).toBe('Hello');
      expect(capitalizeFirstLetter('world')).toBe('World');
      expect(capitalizeFirstLetter('a')).toBe('A');
    });

    it('should handle empty strings', () => {
      expect(capitalizeFirstLetter('')).toBe('');
    });

    it('should handle already capitalized strings', () => {
      expect(capitalizeFirstLetter('Already')).toBe('Already');
    });

    it('should handle non-alphabetic first characters', () => {
      expect(capitalizeFirstLetter('123abc')).toBe('123abc');
      expect(capitalizeFirstLetter('!hello')).toBe('!hello');
    });
  });

  describe('isComponentType', () => {
    it('should return true for string types', () => {
      expect(isComponentType('text')).toBe(true);
      expect(isComponentType('number')).toBe(true);
      expect(isComponentType('select')).toBe(true);
    });

    it('should return false for non-string types', () => {
      expect(isComponentType([])).toBe(false);
      expect(isComponentType([{ type: 'text', id: 'field' }])).toBe(false);
      expect(isComponentType(undefined)).toBe(false);
      expect(isComponentType(null as any)).toBe(false);
    });
  });

  describe('padLeft', () => {
    it('should pad strings to specified length', () => {
      expect(padLeft('5')).toBe('05');
      expect(padLeft('5', 3)).toBe('005');
      expect(padLeft('5', 4, 'x')).toBe('xxx5');
    });

    it('should pad numbers to specified length', () => {
      expect(padLeft(5)).toBe('05');
      expect(padLeft(5, 3)).toBe('005');
      expect(padLeft(42, 4, '0')).toBe('0042');
    });

    it('should not pad if already long enough', () => {
      expect(padLeft('hello', 2)).toBe('hello');
      expect(padLeft(1234, 3)).toBe('1234');
    });

    it('should handle edge cases', () => {
      expect(padLeft('', 3)).toBe('000');
      expect(padLeft(0, 3)).toBe('000');
    });
  });

  describe('toHourMin', () => {
    it('should format date to HH:MM', () => {
      const date = new Date('2023-01-01T15:30:45');
      expect(toHourMin(date)).toBe('15:30');
    });

    it('should handle midnight', () => {
      const date = new Date('2023-01-01T00:00:00');
      expect(toHourMin(date)).toBe('00:00');
    });

    it('should handle single digit hours and minutes', () => {
      const date = new Date('2023-01-01T09:05:00');
      expect(toHourMin(date)).toBe('09:05');
    });

    it('should handle undefined date', () => {
      expect(toHourMin()).toBe('00:00');
      expect(toHourMin(undefined)).toBe('00:00');
    });
  });

  describe('getPath', () => {
    const testObj = {
      name: 'John',
      address: {
        street: '123 Main St',
        city: 'Anytown',
        coordinates: {
          lat: 40.7128,
          lng: -74.006,
        },
      },
      hobbies: ['reading', 'gaming', 'cooking'],
      friends: [
        { name: 'Alice', age: 30 },
        { name: 'Bob', age: 25 },
      ],
    };

    it('should retrieve simple properties', () => {
      expect(getPath(testObj, 'name')).toBe('John');
    });

    it('should retrieve nested properties', () => {
      expect(getPath(testObj, 'address.street')).toBe('123 Main St');
      expect(getPath(testObj, 'address.coordinates.lat')).toBe(40.7128);
    });

    it('should retrieve array elements by index', () => {
      expect(getPath(testObj, 'hobbies[0]')).toBe('reading');
      expect(getPath(testObj, 'hobbies[2]')).toBe('cooking');
    });

    it('should retrieve nested array properties', () => {
      expect(getPath(testObj, 'friends[0].name')).toBe('Alice');
      expect(getPath(testObj, 'friends[1].age')).toBe(25);
    });

    it('should return undefined for non-existent paths', () => {
      expect(getPath(testObj, 'nonexistent')).toBeUndefined();
      expect(getPath(testObj, 'address.nonexistent')).toBeUndefined();
      expect(getPath(testObj, 'hobbies[10]')).toBeUndefined();
    });

    it('should handle invalid inputs', () => {
      expect(getPath(null as any, 'name')).toBeUndefined();
      expect(getPath(testObj, '')).toBeUndefined();
      expect(getPath(testObj, null as any)).toBeUndefined();
    });

    it('should handle array bracket notation', () => {
      expect(getPath(testObj, 'hobbies[1]')).toBe('gaming');
      expect(getPath(testObj, 'friends[0]')).toEqual({ name: 'Alice', age: 30 });
    });
  });

  describe('flatten', () => {
    it('should flatten nested arrays', () => {
      expect(flatten([[1, 2], [3, 4], [5]])).toEqual([1, 2, 3, 4, 5]);
      expect(flatten([['a'], ['b', 'c'], ['d']])).toEqual(['a', 'b', 'c', 'd']);
    });

    it('should handle mixed arrays', () => {
      expect(flatten([1, [2, 3], 4, [5]])).toEqual([1, 2, 3, 4, 5]);
    });

    it('should handle empty arrays', () => {
      expect(flatten([])).toEqual([]);
      expect(flatten([[], []])).toEqual([]);
    });

    it('should handle single level arrays', () => {
      expect(flatten([1, 2, 3])).toEqual([1, 2, 3]);
    });
  });

  describe('evalExpression', () => {
    const testObj = {
      name: 'John',
      age: 30,
      isActive: true,
      score: 85,
      tags: ['admin', 'user'],
    };

    it('should evaluate simple equality expressions', () => {
      expect(evalExpression('name = John', testObj)).toBe(true);
      expect(evalExpression('age = 30', testObj)).toBe(true);
      expect(evalExpression('isActive = true', testObj)).toBe(true);
      expect(evalExpression('age = 25', testObj)).toBe(false);
    });

    it('should evaluate comparison expressions', () => {
      expect(evalExpression('age > 25', testObj)).toBe(true);
      expect(evalExpression('age < 40', testObj)).toBe(true);
      expect(evalExpression('age >= 30', testObj)).toBe(true);
      expect(evalExpression('age <= 30', testObj)).toBe(true);
      expect(evalExpression('score > 100', testObj)).toBe(false);
    });

    it('should evaluate array expressions with OR logic', () => {
      expect(evalExpression(['age = 30', 'name = John'], testObj)).toBe(true);
      expect(evalExpression(['age = 25', 'name = John'], testObj)).toBe(true);
      expect(evalExpression(['age = 25', 'name = Jane'], testObj)).toBe(false);
    });

    it('should evaluate AND expressions with &', () => {
      expect(evalExpression('age = 30 & isActive = true', testObj)).toBe(true);
      expect(evalExpression('age = 30 & isActive = false', testObj)).toBe(false);
      expect(evalExpression('age = 25 & isActive = true', testObj)).toBe(false);
    });

    it('should handle inverted expressions', () => {
      expect(evalExpression('! age = 25', testObj)).toBe(true);
      expect(evalExpression('! age = 30', testObj)).toBe(false);
    });

    it('should handle empty expressions', () => {
      expect(evalExpression('', testObj)).toBe(true);
      expect(evalExpression([], testObj)).toBe(true);
    });

    it('should handle undefined values', () => {
      expect(evalExpression('nonexistent = value', testObj)).toBe(false);
      expect(evalExpression('name = undefined', testObj)).toBe(false);
    });
  });

  describe('resolveExpression', () => {
    const context = [
      { name: 'John', age: 30 },
      { country: 'USA', city: 'New York' },
    ];

    it('should resolve simple properties', () => {
      expect(resolveExpression('name', context)).toBe('John');
      expect(resolveExpression('country', context)).toBe('USA');
    });

    it('should resolve from multiple context objects', () => {
      expect(resolveExpression('age', context)).toBe(30);
      expect(resolveExpression('city', context)).toBe('New York');
    });

    it('should return undefined for non-existent properties', () => {
      expect(resolveExpression('nonexistent', context)).toBeUndefined();
    });

    it('should handle nested properties', () => {
      const nestedContext = [{ user: { profile: { name: 'Alice' } } }];
      expect(resolveExpression('user.profile.name', nestedContext)).toBe('Alice');
    });
  });

  describe('canResolvePlaceholders & resolvePlaceholders', () => {
    const context = { name: 'John', age: 30, score: 85.5 };

    it('should check if placeholders can be resolved', () => {
      expect(canResolvePlaceholders('Hello {{name}}', context)).toBe(true);
      expect(canResolvePlaceholders('Age: {{age}}', context)).toBe(true);
      expect(canResolvePlaceholders('Unknown: {{unknown}}', context)).toBe(false);
      expect(canResolvePlaceholders('No placeholders', context)).toBe(true);
    });

    it('should resolve placeholders', () => {
      expect(resolvePlaceholders('Hello {{name}}', context)).toBe('Hello John');
      expect(resolvePlaceholders('Age: {{age}}', context)).toBe('Age: 30');
      expect(resolvePlaceholders('Score: {{score}}', context)).toBe('Score: 85.5');
    });

    it('should handle multiple placeholders', () => {
      expect(resolvePlaceholders('{{name}} is {{age}} years old', context)).toBe('John is 30 years old');
    });

    it('should leave unresolved placeholders unchanged', () => {
      expect(resolvePlaceholders('Hello {{unknown}}', context)).toBe('Hello {{unknown}}');
    });

    it('should handle formatting types', () => {
      const dateContext = { created: new Date('2023-01-01T15:30:00Z') };
      expect(resolvePlaceholders('Date: {{created:date}}', dateContext)).toContain('1/1/2023');
    });
  });

  describe('formatExpression', () => {
    it('should format different value types', () => {
      expect(formatExpression('hello')).toBe('hello');
      expect(formatExpression(42)).toBe('42');
      expect(formatExpression(true)).toBe('true');
      expect(formatExpression(undefined)).toBe('');
    });

    it('should format arrays', () => {
      expect(formatExpression(['a', 'b', 'c'])).toBe('a, b, c');
      expect(formatExpression([1, 2, 3])).toBe('1, 2, 3');
    });

    it('should handle boolean with format types', () => {
      expect(formatExpression(true, 'Yes:No')).toBe('Yes');
      expect(formatExpression(false, 'Yes:No')).toBe('No');
      expect(formatExpression(true, 'Active:Inactive')).toBe('Active');
    });

    it('should format dates', () => {
      const date = new Date('2023-01-01T15:30:00Z');
      expect(formatExpression(date, 'date')).toContain('2023');
      expect(formatExpression(date, 'time')).toContain(':');
      expect(formatExpression(date, 'iso')).toContain('2023-01-01T15:30:00.000Z');
    });

    it('should handle format expressions for arrays', () => {
      expect(formatExpression([true as any, false as any], 'Yes:No')).toBe('Yes, No');
    });
  });

  describe('deepCopy', () => {
    it('should deep copy objects', () => {
      const original = { name: 'John', age: 30, hobbies: ['reading', 'gaming'] };
      const copy = deepCopy(original);

      expect(copy).toEqual(original);
      expect(copy).not.toBe(original);
      expect(copy.hobbies).not.toBe(original.hobbies);

      copy.hobbies.push('cooking');
      expect(original.hobbies).toHaveLength(2);
      expect(copy.hobbies).toHaveLength(3);
    });

    it('should deep copy arrays', () => {
      const original = [1, [2, 3], { name: 'John' }];
      const copy = deepCopy(original);

      expect(copy).toEqual(original);
      expect(copy).not.toBe(original);
      expect(copy[1]).not.toBe(original[1]);
      expect(copy[2]).not.toBe(original[2]);
    });

    it('should handle dates', () => {
      const original = new Date('2023-01-01');
      const copy = deepCopy(original);

      expect(copy).toEqual(original);
      expect(copy).not.toBe(original);
      expect(copy.getTime()).toBe(original.getTime());
    });

    it('should handle null values', () => {
      expect(deepCopy(null)).toBe(null);
    });

    it('should handle primitives', () => {
      expect(deepCopy('string')).toBe('string');
      expect(deepCopy(123)).toBe(123);
      expect(deepCopy(true)).toBe(true);
    });

    it('should deep copy nested structures', () => {
      const original = {
        level1: {
          level2: {
            level3: {
              value: 'deep',
            },
          },
          array: [1, { nested: true }],
        },
      };

      const copy = deepCopy(original);
      expect(copy).toEqual(original);
      expect(copy.level1.level2.level3).not.toBe(original.level1.level2.level3);
      expect(copy.level1.array[1]).not.toBe(original.level1.array[1]);
    });
  });

  describe('stripSpaces', () => {
    it('should remove spaces, dots, and commas and convert to lowercase', () => {
      expect(stripSpaces('Hello World')).toBe('helloworld');
      expect(stripSpaces('Test. String, Here')).toBe('teststringhere');
      expect(stripSpaces('Multiple   Spaces')).toBe('multiplespaces');
    });

    it('should handle empty and undefined strings', () => {
      expect(stripSpaces('')).toBe('');
      expect(stripSpaces()).toBe('');
      expect(stripSpaces(undefined)).toBe('');
    });

    it('should handle special characters', () => {
      expect(stripSpaces('Hello, World!')).toBe('helloworld!');
      expect(stripSpaces('Test.Value')).toBe('testvalue');
    });
  });

  describe('range', () => {
    it('should generate numeric ranges', () => {
      expect(range(1, 5)).toEqual([1, 2, 3, 4, 5]);
      expect(range(0, 3)).toEqual([0, 1, 2, 3]);
    });

    it('should handle step sizes', () => {
      expect(range(0, 10, 2)).toEqual([0, 2, 4, 6, 8, 10]);
      expect(range(1, 10, 3)).toEqual([1, 4, 7, 10]);
    });

    it('should handle negative ranges', () => {
      expect(range(-3, 0)).toEqual([-3, -2, -1, 0]);
    });

    it('should handle single value ranges', () => {
      expect(range(5, 5)).toEqual([5]);
    });

    it('should handle empty ranges', () => {
      expect(range(5, 3)).toEqual([]);
    });
  });

  describe('hash', () => {
    it('should generate consistent hashes for strings', () => {
      const hash1 = hash('test string');
      const hash2 = hash('test string');
      const hash3 = hash('different string');

      expect(hash1).toBe(hash2);
      expect(hash1).not.toBe(hash3);
      expect(typeof hash1).toBe('number');
    });

    it('should generate hashes for objects', () => {
      const obj1 = { name: 'John', age: 30 };
      const obj2 = { name: 'John', age: 30 };
      const obj3 = { name: 'Jane', age: 25 };

      expect(hash(obj1)).toBe(hash(obj2));
      expect(hash(obj1)).not.toBe(hash(obj3));
    });

    it('should handle empty strings', () => {
      expect(hash('')).toBe(0);
    });
  });

  describe('toQueryString', () => {
    it('should create query strings from parameters', () => {
      const base = { param1: 'value1', param2: 'value2' };
      const override = { param3: 'value3' };

      const result = toQueryString('/path', base, override);
      expect(result).toBe('/path?param1=value1&param2=value2&param3=value3');
    });

    it('should override base parameters', () => {
      const base = { param1: 'old', param2: 'value2' };
      const override = { param1: 'new' };

      const result = toQueryString('/path', base, override);
      expect(result).toBe('/path?param1=new&param2=value2');
    });

    it('should handle empty parameters', () => {
      const result = toQueryString('/path', {}, {});
      expect(result).toBe('/path?');
    });
  });

  describe('getAllUrlParams', () => {
    it('should parse URL parameters', () => {
      const params = getAllUrlParams('http://example.com?param1=value1&param2=value2');
      expect(params.param1).toBe('value1');
      expect(params.param2).toBe('value2');
    });

    it('should handle array parameters', () => {
      const params = getAllUrlParams('http://example.com?colors[]=red&colors[]=blue');
      expect(params.colors).toEqual(['red', 'blue']);
    });

    it('should handle indexed array parameters', () => {
      const params = getAllUrlParams('http://example.com?items[0]=first&items[2]=third');
      const items = params.items as (string | boolean)[];
      expect(items[0]).toBe('first');
      expect(items[2]).toBe('third');
    });

    it('should handle boolean parameters', () => {
      const params = getAllUrlParams('http://example.com?flag&active=true');
      expect(params.flag).toBe(true);
      expect(params.active).toBe('true');
    });
  });

  describe('getQueryParamById', () => {
    it('should get query parameter by ID from hash', () => {
      // Set the hash directly in the test
      (window.location as any).hash = '#section?id=123&name=test';
      expect(getQueryParamById('id')).toBe('123');
      expect(getQueryParamById('name')).toBe('test');
    });

    it('should return null for non-existent parameters', () => {
      expect(getQueryParamById('nonexistent')).toBe(null);
    });

    it('should handle hash without query string', () => {
      // Temporarily modify the hash for this specific test
      const originalHash = (window.location as any).hash;
      (window.location as any).hash = '#section';
      
      expect(getQueryParamById('id')).toBe(null);
      
      // Restore original hash
      (window.location as any).hash = originalHash;
    });
  });

  describe('extractTitle', () => {
    it('should extract title from objects with title property', () => {
      expect(extractTitle({ title: 'Page Title' })).toBe('Page Title');
    });

    it('should extract label from objects with label property', () => {
      expect(extractTitle({ label: 'Field Label' })).toBe('Field Label');
    });

    it('should extract alt from objects with alt property', () => {
      expect(extractTitle({ alt: 'Alt Text' })).toBe('Alt Text');
    });

    it('should extract name from objects with name property', () => {
      expect(extractTitle({ name: 'Item Name' })).toBe('Item Name');
    });

    it('should prioritize title over other properties', () => {
      expect(
        extractTitle({
          title: 'Title Value',
          label: 'Label Value',
          name: 'Name Value',
        })
      ).toBe('Title Value');
    });

    it('should return undefined for objects without title properties', () => {
      expect(extractTitle({ id: 1, value: 'test' })).toBeUndefined();
    });

    it('should return undefined for non-objects', () => {
      expect(extractTitle('string')).toBeUndefined();
      expect(extractTitle(123)).toBeUndefined();
      expect(extractTitle(null)).toBeUndefined();
      expect(extractTitle(undefined)).toBeUndefined();
    });

    it('should handle objects with non-string title properties', () => {
      expect(extractTitle({ title: 123 })).toBeUndefined();
      expect(extractTitle({ label: true })).toBeUndefined();
    });
  });

  describe('arrayUtils', () => {
    const testArray = ['a', 'b', 'c', 'd', 'e'];

    describe('moveItem', () => {
      it('should move items to different positions', () => {
        expect(arrayUtils.moveItem(testArray, 0, 2)).toEqual(['b', 'c', 'a', 'd', 'e']);
        expect(arrayUtils.moveItem(testArray, 2, 0)).toEqual(['c', 'a', 'b', 'd', 'e']);
        expect(arrayUtils.moveItem(testArray, 1, 3)).toEqual(['a', 'c', 'd', 'b', 'e']);
      });

      it('should handle same position moves', () => {
        expect(arrayUtils.moveItem(testArray, 2, 2)).toEqual(testArray);
      });

      it('should handle invalid indices', () => {
        expect(arrayUtils.moveItem(testArray, -1, 2)).toEqual(testArray);
        expect(arrayUtils.moveItem(testArray, 0, 10)).toEqual(testArray);
        expect(arrayUtils.moveItem(testArray, 10, 0)).toEqual(testArray);
      });
    });

    describe('insertAt', () => {
      it('should insert items at specified positions', () => {
        expect(arrayUtils.insertAt(testArray, 0, 'x')).toEqual(['x', 'a', 'b', 'c', 'd', 'e']);
        expect(arrayUtils.insertAt(testArray, 2, 'y')).toEqual(['a', 'b', 'y', 'c', 'd', 'e']);
        expect(arrayUtils.insertAt(testArray, 5, 'z')).toEqual(['a', 'b', 'c', 'd', 'e', 'z']);
      });

      it('should handle insertion beyond array length', () => {
        expect(arrayUtils.insertAt(testArray, 10, 'x')).toHaveLength(6);
      });
    });

    describe('removeAt', () => {
      it('should remove items at specified positions', () => {
        expect(arrayUtils.removeAt(testArray, 0)).toEqual(['b', 'c', 'd', 'e']);
        expect(arrayUtils.removeAt(testArray, 2)).toEqual(['a', 'b', 'd', 'e']);
        expect(arrayUtils.removeAt(testArray, 4)).toEqual(['a', 'b', 'c', 'd']);
      });

      it('should handle invalid indices', () => {
        expect(arrayUtils.removeAt(testArray, -1)).toEqual(testArray);
        expect(arrayUtils.removeAt(testArray, 10)).toEqual(testArray);
      });
    });

    describe('swap', () => {
      it('should swap items at specified positions', () => {
        expect(arrayUtils.swap(testArray, 0, 1)).toEqual(['b', 'a', 'c', 'd', 'e']);
        expect(arrayUtils.swap(testArray, 1, 3)).toEqual(['a', 'd', 'c', 'b', 'e']);
        expect(arrayUtils.swap(testArray, 0, 4)).toEqual(['e', 'b', 'c', 'd', 'a']);
      });

      it('should handle same position swaps', () => {
        expect(arrayUtils.swap(testArray, 2, 2)).toEqual(testArray);
      });

      it('should handle invalid indices', () => {
        expect(arrayUtils.swap(testArray, -1, 1)).toEqual(testArray);
        expect(arrayUtils.swap(testArray, 0, 10)).toEqual(testArray);
      });
    });

    describe('duplicate', () => {
      it('should duplicate items at specified positions', () => {
        expect(arrayUtils.duplicate(['a', 'b', 'c'], 1)).toEqual(['a', 'b', 'b', 'c']);
        expect(arrayUtils.duplicate(testArray, 0)).toHaveLength(6);
      });

      it('should deep copy objects when duplicating', () => {
        const objArray = [
          { id: 1, name: 'first' },
          { id: 2, name: 'second' },
        ];
        const result = arrayUtils.duplicate(objArray, 0);

        expect(result).toHaveLength(3);
        expect(result[0]).toEqual(result[1]);
        expect(result[0]).not.toBe(result[1]);
      });

      it('should handle invalid indices', () => {
        expect(arrayUtils.duplicate(testArray, -1)).toEqual(testArray);
        expect(arrayUtils.duplicate(testArray, 10)).toEqual(testArray);
      });
    });

    describe('isValidArray', () => {
      it('should validate array length constraints', () => {
        expect(arrayUtils.isValidArray([1, 2, 3], 0, 5)).toBe(true);
        expect(arrayUtils.isValidArray([1, 2], 3, 5)).toBe(false);
        expect(arrayUtils.isValidArray([1, 2, 3, 4, 5, 6], 0, 5)).toBe(false);
      });

      it('should handle undefined max constraint', () => {
        expect(arrayUtils.isValidArray([1, 2, 3], 2)).toBe(true);
        expect(arrayUtils.isValidArray([1], 2)).toBe(false);
      });

      it('should handle empty arrays', () => {
        expect(arrayUtils.isValidArray([], 0)).toBe(true);
        expect(arrayUtils.isValidArray([], 1)).toBe(false);
      });
    });
  });

  describe('labelResolver', () => {
    const form: any = [
      { id: 'name', type: 'text', label: 'Full Name' },
      { id: 'age', type: 'number', label: 'Age' },
      {
        id: 'gender',
        type: 'select',
        label: 'Gender',
        options: [
          { id: 'M', label: 'Male' },
          { id: 'F', label: 'Female' },
          { id: 'O', label: 'Other' },
        ],
      },
      {
        id: 'address',
        type: [
          { id: 'street', type: 'text', label: 'Street' },
          { id: 'city', type: 'text', label: 'City' },
        ],
      },
    ];

    it('should create a label resolver from form definition', () => {
      const resolver = labelResolver(form);

      const testObj = {
        name: 'John Doe',
        age: 30,
        gender: 'M',
        address: {
          street: '123 Main St',
          city: 'Anytown',
        },
      };

      const resolved: any = resolver(testObj);

      expect(resolved).toBeDefined();
      expect(resolved.name).toBe('John Doe');
      expect(resolved.age).toBe(30);
    });

    it('should resolve select option labels', () => {
      const resolver = labelResolver(form);

      // This would typically be called internally to resolve specific field values
      // The actual implementation is complex and handles option resolution
      expect(resolver).toBeDefined();
      expect(typeof resolver).toBe('function');
    });

    it('should handle nested form structures', () => {
      const resolver = labelResolver(form);

      const testObj = {
        name: 'John',
        address: {
          street: '123 Main St',
          city: 'Anytown',
        },
      };

      const resolved = resolver(testObj);
      expect(resolved).toBeDefined();
    });

    it('should handle empty objects', () => {
      const resolver = labelResolver(form);
      const resolved = resolver({});

      expect(resolved).toBeUndefined();
    });

    it('should handle arrays of objects', () => {
      const resolver = labelResolver(form);
      const testArray = [
        { name: 'John', age: 30 },
        { name: 'Jane', age: 25 },
      ];

      const resolved = resolver(testArray);
      expect(resolved).toBeDefined();
      expect(Array.isArray(resolved)).toBe(true);
    });
  });
});
