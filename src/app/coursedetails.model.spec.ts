import { Coursedetails } from './coursedetails.model';

describe('Coursedetails', () => {
  it('should create an instance', () => {
    // Pass required arguments 'name' and 'color'
    expect(new Coursedetails('Test Course', '#FF5733')).toBeTruthy();
  });
});
