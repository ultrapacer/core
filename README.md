![My image](https://ultrapacer.com/public/img/logo-72x72.png)

# using ultraPacer
Go to [https://ultrapacer.com](https://ultrapacer.com)

## No License / Copyright
The source code herin is copyright to Danny Murphy.
This code may be forked, downloaded, and/or modified for the purposes of
contributing to this project only. There is no license for any other use or
distribution.

## Course Model fields
- **cutoff**
- **cutoffs**
- **db**
- **dist**, *Number*\
  Total distance of course (km)
- **distScale**, *Number*, *optional*\
  Distance scaling factor
- **gain**, *Number*\
  Total amount of vertical gain in course (m)
- **gainScale**, *Number*, *optional*\
  Vertical gain scaling factor
- **event**
- **eventStart**
- **eventTimezone**
- **eventTimezoneFixed**
- **loss**, *Number*\
  Total amount of vertical loss in course (m)
- **lossScale**, *Number*, *optional*\
  Vertical loss scaling factor
- **meta**
- **name**
- **points**
- **scales**: Object, *optional* \
  { *factor1*: Number, *factor2*: Number, ... } \
  Scale factors to be applied on top of base pacing models. A value of 1 does nothing.
- **splits**
- **stats**
- **track**
- **waypoints**

## Plan Model fields
- **adjustForCutoffs**
- **course**
- **created**
- **cutoffMargin**
- **cutoffs**
- **db**
- **delays**
- **event**
- **heatModel**
- **notes**
- **pacing**
- **pacingMethod**
- **pacingTarget**
- **scales**: Object, optional \
  { *factor1*: Number, *factor2*: Number, ... } \
  Scale factors to be applied on top of base pacing models. A value of 1 does nothing.
- **splits**
- **startTime**
- **strategy**
- **waypointDelay**
