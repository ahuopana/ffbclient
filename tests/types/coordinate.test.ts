import { Coordinate } from '../../types/coordinate';

describe('Coordinate', () => {
    describe('toArray', () => {
        test('returns [x, y]', () => {
            let coordinate = new Coordinate(3, 7);

            expect(coordinate.toArray()).toEqual([3, 7]);
        });

        test('round-trips through FromArray', () => {
            let original = new Coordinate(12, 4);
            let restored = Coordinate.FromArray(original.toArray());

            expect(restored.x).toBe(12);
            expect(restored.y).toBe(4);
        });
    });
});
