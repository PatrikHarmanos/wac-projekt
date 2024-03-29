/* eslint-disable */
/* tslint:disable */
/**
 * This is an autogenerated file created by the Stencil compiler.
 * It contains typing information for all components that exist in this project.
 */
import { HTMLStencilElement, JSXBase } from "@stencil/core/internal";
export namespace Components {
    interface HarkapAmbulanceWlApp {
        "ambulanceId": string;
        "apiBase": string;
        "basePath": string;
    }
}
declare global {
    interface HTMLHarkapAmbulanceWlAppElement extends Components.HarkapAmbulanceWlApp, HTMLStencilElement {
    }
    var HTMLHarkapAmbulanceWlAppElement: {
        prototype: HTMLHarkapAmbulanceWlAppElement;
        new (): HTMLHarkapAmbulanceWlAppElement;
    };
    interface HTMLElementTagNameMap {
        "harkap-ambulance-wl-app": HTMLHarkapAmbulanceWlAppElement;
    }
}
declare namespace LocalJSX {
    interface HarkapAmbulanceWlApp {
        "ambulanceId"?: string;
        "apiBase"?: string;
        "basePath"?: string;
    }
    interface IntrinsicElements {
        "harkap-ambulance-wl-app": HarkapAmbulanceWlApp;
    }
}
export { LocalJSX as JSX };
declare module "@stencil/core" {
    export namespace JSX {
        interface IntrinsicElements {
            "harkap-ambulance-wl-app": LocalJSX.HarkapAmbulanceWlApp & JSXBase.HTMLAttributes<HTMLHarkapAmbulanceWlAppElement>;
        }
    }
}
