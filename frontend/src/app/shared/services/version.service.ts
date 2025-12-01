import { Injectable } from '@angular/core';
import packageJson from '../../../../package.json';

@Injectable({
  providedIn: 'root'
})
export class VersionService {
  private version: string = packageJson.version;

  getVersion(): string {
    return this.version; 
  }
}