import { Component, Host, Prop, State, h, EventEmitter, Event } from '@stencil/core';
import { AmbulanceDeviceLogListApiFactory, DeviceLog } from '../../api/ambulance-wl';

@Component({
  tag: 'harkap-ambulance-log-editor',
  styleUrl: 'harkap-ambulance-log-editor.css',
  shadow: true,
})
export class HarkapAmbulanceLogEditor {
  @State() private relativePath = "";
  @Prop() logId: string;
  @Prop() entryId: string;
  @Prop() basePath: string = "";
  @Prop() apiBase: string;
  @State() log: DeviceLog;
  @State() errorMessage:string;
  @State() isValid: boolean;

  private formElement: HTMLFormElement;

  private async getDeviceLogAsync(): Promise<DeviceLog> {
    if(this.logId === "@new") {
      this.isValid = false;
      let uniqueId = () => {
        return Math.random().toString(36).substr(2, 9);
      }
         this.log = {
            id: uniqueId(),
            deviceId: "",
            createdAt: "",
            text: "",
         };
         return this.log;
    }

      if (!this.logId ) {
         this.isValid = false;
         return undefined
      }
      try {
         const response
             = await AmbulanceDeviceLogListApiFactory(undefined, this.apiBase)
               .getDeviceLog(this.entryId, this.logId)

         if (response.status < 299) {
            this.log = response.data;
            this.isValid = true;
         } else {
            this.errorMessage = `Cannot retrieve log: ${response.statusText}`
         }
      } catch (err: any) {
         this.errorMessage = `Cannot retrieve log: ${err.message || "unknown"}`
      }
      return undefined;
  }

  async componentWillLoad() {
    this.getDeviceLogAsync();

    const baseUri = new URL(this.basePath, document.baseURI || "/").pathname;

     const toRelative = (path: string) => {
       if (path.startsWith(baseUri)) {
         this.relativePath = path.slice(baseUri.length)
       } else {
         this.relativePath = ""
       }
     }

     window.navigation?.addEventListener("navigate", (ev: Event) => {
       if ((ev as any).canIntercept) { (ev as any).intercept(); }
       let path = new URL((ev as any).destination.url).pathname;
       toRelative(path);
     });

     toRelative(location.pathname)
   }

  @Event({eventName: "log-closed"}) logClosed: EventEmitter<string>;

  render() {
    const navigate = (path:string) => {
      const absolute = new URL(path, new URL(this.basePath, document.baseURI)).pathname;
      window.navigation.navigate(absolute)
    }

    if(this.errorMessage) {
      return (
      <Host>
         <div class="error">{this.errorMessage}</div>
      </Host>
      )
   }
    return (
      <Host>
        <form ref={el => this.formElement = el}>
          <md-filled-text-field
            required value={this.log?.text}
            oninput={ (ev: InputEvent) => {
               if(this.log) {this.log.text = this.handleInputEvent(ev)}
            }}
            label="Text"
            >
            <md-icon slot="leading-icon">devices</md-icon>
          </md-filled-text-field>

          <md-filled-text-field
            required value={this.log?.deviceId}
            oninput={ (ev: InputEvent) => {
               if(this.log) {this.log.deviceId = this.handleInputEvent(ev)}
            }}
            label="ID zariadenia" >
            <md-icon slot="leading-icon">pin</md-icon>
          </md-filled-text-field>

          <md-filled-text-field
            type="date"
            required value={this.log?.createdAt ? new Date(this.log?.createdAt).toISOString().substring(0, 10) : ''}
            oninput={ (ev: InputEvent) => {
               if(this.log) {this.log.createdAt = this.handleDateInputEvent(ev)}
            }}
            label="Dátum a čas" >
            <md-icon slot="leading-icon">watch_later</md-icon>
          </md-filled-text-field>
        </form>

        <md-divider></md-divider>
        <div class="actions">
          <md-filled-tonal-button id="delete" disabled={!this.log || this.log?.id === "@new" }
            onClick={() => this.deleteEntry()} >
            <md-icon slot="icon">delete</md-icon>
            Zmazať
          </md-filled-tonal-button>
          <span class="stretch-fill"></span>
          <md-outlined-button id="cancel"
            onClick={() => this.logClosed.emit("cancel")}>
            Zrušiť
          </md-outlined-button>
          <md-filled-button id="confirm" disabled={ !this.isValid }
            onClick={() => this.updateEntry() }
          >
            <md-icon slot="icon">save</md-icon>
            Uložiť
          </md-filled-button>
        </div>
      </Host>
    );
  }

  private handleInputEvent( ev: InputEvent): string {
   const target = ev.target as HTMLInputElement;
   // check validity of elements
   this.isValid = true;
   for (let i = 0; i < this.formElement.children.length; i++) {
      const element = this.formElement.children[i]
      if ("reportValidity" in element) {
      const valid = (element as HTMLInputElement).reportValidity();
      this.isValid &&= valid;
      }
   }
   return target.value
  }

  private handleDateInputEvent(ev: InputEvent): string {
    const target = ev.target as HTMLInputElement;
     console.log(target.value);
    const date = new Date(target.value);
    if (isNaN(date.getTime())) {
        target.setCustomValidity("Invalid date format")
    } else {
        target.setCustomValidity("")
    }
    return date.toISOString();
  }

  private async updateEntry() {
   try {
       const api = AmbulanceDeviceLogListApiFactory(undefined, this.apiBase);
         const response
            = this.logId === "@new"
            ? await api.createDeviceLog(this.entryId, this.log)
            : await api.updateDeviceLog(this.entryId, this.logId, this.log);
       if (response.status < 299) {
         this.logClosed.emit("store")
       } else {
         this.errorMessage = `Cannot store log: ${response.statusText}`
       }
     } catch (err: any) {
       this.errorMessage = `Cannot store log: ${err.message || "unknown"}`
     }
  }

  private async deleteEntry() {
   try {
      const response = await AmbulanceDeviceLogListApiFactory(undefined, this.apiBase)
         .deleteDeviceLog(this.entryId, this.logId)
      if (response.status < 299) {
      this.logClosed.emit("delete")
      } else {
      this.errorMessage = `Cannot delete log: ${response.statusText}`
      }
   } catch (err: any) {
      this.errorMessage = `Cannot delete log: ${err.message || "unknown"}`
   }
}

}
