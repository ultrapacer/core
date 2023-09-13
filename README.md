![My image](https://ultrapacer.com/public/img/logo-72x72.png)

# using ultraPacer

Go to [https://ultrapacer.com](https://ultrapacer.com)

## No License / Copyright

The source code herin is copyright to ULTRAPACER, LLC.
This code may be forked, downloaded, and/or modified for the purposes of
contributing to this project only. There is no license for any other use or
distribution.

## Course Model fields

- **cutoff**
- **cutoffs**
- **db**
- **dist**, _Number_\
  Total distance of course (km)
- **distScale**, _Number_, _optional_\
  Distance scaling factor
- **gain**, _Number_\
  Total amount of vertical gain in course (m)
- **gainScale**, _Number_, _optional_\
  Vertical gain scaling factor
- **event**
- **eventStart**
- **eventTimezone**
- **eventTimezoneFixed**
- **loss**, _Number_\
  Total amount of vertical loss in course (m)
- **lossScale**, _Number_, _optional_\
  Vertical loss scaling factor
- **meta**
- **name**
- **points**
- **scales**: Object, _optional_ \
  { _factor1_: Number, _factor2_: Number, ... } \
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
  { _factor1_: Number, _factor2_: Number, ... } \
  Scale factors to be applied on top of base pacing models. A value of 1 does nothing.
- **splits**
- **strategy**
- **waypointDelay**
