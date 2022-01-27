import { pipe } from 'rxjs';
import { filter, pluck } from 'rxjs/operators';

export const ofType = (_type: string): any =>
  pipe(
    filter(([type]) => type === _type),
    pluck('1')
  );
