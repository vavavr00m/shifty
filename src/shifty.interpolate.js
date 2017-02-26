import { Tweenable, clone, composeEasingObject, tweenProps } from './shifty.core';

const getInterpolatedValues =
  (from, current, targetState, position, easing, delay) =>
  tweenProps(
    position, current, from, targetState, 1, delay, easing);

// Fake a Tweenable and patch some internals.  This approach allows us to
// skip uneccessary processing and object recreation, cutting down on garbage
// collection pauses.
const mockTweenable = new Tweenable();
mockTweenable._filterArgs = [];

/**
 * Compute the midpoint of two Objects.  This method effectively calculates a
 * specific frame of animation that `{{#crossLink
 * "Tweenable/tween:method"}}{{/crossLink}}` does many times over the course
 * of a full tween.
 *
 *     const interpolatedValues = Tweenable.interpolate({
 *       width: '100px',
 *       opacity: 0,
 *       color: '#fff'
 *     }, {
 *       width: '200px',
 *       opacity: 1,
 *       color: '#000'
 *     }, 0.5);
 *
 *     console.log(interpolatedValues);
 *     // {opacity: 0.5, width: "150px", color: "rgb(127,127,127)"}
 *
 * @static
 * @method interpolate
 * @param {Object} from The starting values to tween from.
 * @param {Object} targetState The ending values to tween to.
 * @param {number} position The normalized position value (between `0.0` and
 * `1.0`) to interpolate the values between `from` and `to` for.  `from`
 * represents `0` and `to` represents `1`.
 * @param {Object.<string|Function>|string|Function} easing The easing
 * curve(s) to calculate the midpoint against.  You can reference any easing
 * function attached to `Tweenable.formulas`, or provide the easing
 * function(s) directly.  If omitted, this defaults to "linear".
 * @param {number=} delay Optional delay to pad the beginning of the
 * interpolated tween with.  This increases the range of `position` from (`0`
 * through `1`) to (`0` through `1 + delay`).  So, a delay of `0.5` would
 * increase all valid values of `position` to numbers between `0` and `1.5`.
 * @return {Object}
 */
export const interpolate =
  (from, targetState, position, easing, delay = 0) => {

  const current = clone(from);
  const easingObject = composeEasingObject(from, easing);

  mockTweenable.set({});
  mockTweenable._filterArgs = [current, from, targetState, easingObject];

  // Any defined value transformation must be applied
  mockTweenable._applyFilter('tweenCreated');
  mockTweenable._applyFilter('beforeTween');

  const interpolatedValues = getInterpolatedValues(
    from, current, targetState, position, easingObject, delay);

  // Transform values back into their original format
  mockTweenable._applyFilter('afterTween');

  return interpolatedValues;
};
