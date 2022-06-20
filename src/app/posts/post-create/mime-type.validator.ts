import { AbstractControl } from '@angular/forms';
import { Observable, Observer, of } from 'rxjs';

export const mimeType = (
  control: AbstractControl
): Promise<{ [key: string]: any }> | Observable<{ [key: string]: any }> => {
  // If value is string, then return null (valid control)
  if (typeof control.value === 'string') {
    return of(null);
  }

  // Otherwise, value is File and its MIME type must be checked to see if it is a valid image file type
  const file = control.value as File;
  const fileReader = new FileReader();
  const frObs = Observable.create((observer: Observer<{ [key: string]: any }>) => {
    fileReader.addEventListener('loadend', () => {
      const arr = new Uint8Array(fileReader.result as ArrayBuffer).subarray(0, 4);
      let header = '';
      let isValid = false;

      for (let i = 0; i < arr.length; i++) {
        header += arr[i].toString(16);
      }

      // File Magic Numbers - https://gist.github.com/leommoore/f9e57ba2aa4bf197ebc5
      switch (header) {
        // PNG
        case '89504e47':
          isValid = true;
          break;

        // JPEG
        case 'ffd8ffe0':
        case 'ffd8ffe1':
        case 'ffd8ffe2':
        case 'ffd8ffe3':
        case 'ffd8ffe8':
          isValid = true;
          break;

        // Anything else is invalid
        default: // Or you can use the blob.type as fallback
          isValid = false;
          break;
      }

      if (isValid) {
        observer.next(null);
      } else {
        observer.next({ isValidMimeType: true });
      }

      observer.complete();
    });

    fileReader.readAsArrayBuffer(file);
  });

  return frObs;
};
