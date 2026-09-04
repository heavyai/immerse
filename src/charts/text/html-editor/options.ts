/**
 * NOTE: This is a copy from https://github.com/benwinding/quill-html-edit-button
 * so we can sanitize the input on the FE appropriately to prevent js injection
 */

// prettier-ignore
export interface QuillHtmlEditButtonOptions {
  // Flags
  debug?: boolean;              // default:  false 
  syntax?: boolean;             // default:  false  
  // Overlay
  closeOnClickOverlay: boolean; // default:  true                       
  prependSelector: string;      // default:  null                       
  // Labels
  buttonHTML?: string;          // default:  "&lt;&gt;"
  buttonTitle?: string;         // default:  "Show HTML source"
  msg: string;                  // default:  'Edit HTML here, when you click "OK" the quill editor\'s contents will be replaced'     
  okText: string;               // default:  "Ok"
  cancelText: string;           // default:  "Cancel"            
}
