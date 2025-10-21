import { Canvas as FabricCanvas } from "fabric";
import { PropertiesPanel } from "./PropertiesPanel";

interface SelectedElement {
  tagName: string;
  textContent: string;
  styles: Record<string, string>;
  attributes: Record<string, string>;
  selector: string;
}

interface WebPropertiesPanelProps {
  fabricCanvas: FabricCanvas | null;
  selectedObject: any;
  onUpdate: () => void;
  selectedHTMLElement?: SelectedElement | null;
  onUpdateHTMLElement?: (updates: Partial<SelectedElement>) => void;
  onCloseHTMLElement?: () => void;
}

export const WebPropertiesPanel = ({ 
  fabricCanvas, 
  selectedObject, 
  onUpdate,
  selectedHTMLElement,
  onUpdateHTMLElement,
  onCloseHTMLElement,
}: WebPropertiesPanelProps) => {
  return (
    <PropertiesPanel
      fabricCanvas={fabricCanvas}
      selectedObject={selectedObject}
      selectedHTMLElement={selectedHTMLElement}
      onUpdateHTMLElement={onUpdateHTMLElement}
      onCloseHTMLElement={onCloseHTMLElement}
      showCopyPanel={true}
      showImagePanel={true}
      onUpdate={onUpdate}
    />
  );
};
