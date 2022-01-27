import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'dateFormatter'
})
export class DateFormatterPipe implements PipeTransform {

  transform(ms: any, type: any) {
    let date = new Date(ms);
    let result: any;
    if(type == "full")
      result = date.toLocaleDateString("es") + " " + date.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });
    if(type == "medium")
      result = date.toLocaleDateString("en-us", {year: "numeric", month: 'short', day: 'numeric'}) + ", " + date.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });
    else if(type == "date")
      result = date.toLocaleDateString("es");
    else if(type == "month-day")
      result = date.toLocaleString('en-US', { month: 'long', day: 'numeric' });
    else if(type == "time")
      result = date.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });
    return result
  }

}
