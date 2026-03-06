/**
 * WorkflowCanvas Component
 * 
 * The main canvas where workflow nodes are placed and connected.
 * Supports drag-drop, panning, zooming, and edge rendering.
 */

import React, { useCallback, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { WorkflowNode } from './WorkflowNode';
import type { Workflow, WorkflowNode as NodeType, WorkflowEdge, Position } from './types';

interface WorkflowCanvasProps {
  workflow: Workflow;
  selectedNodeId: string | null;
  onSelectNode: (nodeId: string | null) => void;
  onUpdateNode: (nodeId: string, updates: Partial<NodeType>) => void;
  onAddEdge: (sourceId: string, targetId: string, sourceHandle?: 'true' | 'false') => void;
  onDeleteEdge?: (edgeId: string) => void;
  className?: string;
}

export function WorkflowCanvas({
  workflow,
  selectedNodeId,
  onSelectNode,
  onUpdateNode,
  onAddEdge,
  onDeleteEdge,
  className,
}: WorkflowCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState<Position>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragNodeId, setDragNodeId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<Position>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState<Position>({ x: 0, y: 0 });
  
  // Connection state
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectFrom, setConnectFrom] = useState<string | null>(null);
  const [connectLine, setConnectLine] = useState<{ start: Position; end: Position } | null>(null);

  // Handle node drag start
  const handleDragStart = useCallback((nodeId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const node = workflow.nodes.find(n => n.id === nodeId);
    if (!node) return;

    setIsDragging(true);
    setDragNodeId(nodeId);
    
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      setDragOffset({
        x: (e.clientX - rect.left - pan.x) / zoom - node.position.x,
        y: (e.clientY - rect.top - pan.y) / zoom - node.position.y,
      });
    }
  }, [workflow.nodes, pan, zoom]);

  // Handle canvas mouse move (for dragging nodes or panning)
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDragging && dragNodeId && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const newX = (e.clientX - rect.left - pan.x) / zoom - dragOffset.x;
      const newY = (e.clientY - rect.top - pan.y) / zoom - dragOffset.y;
      
      onUpdateNode(dragNodeId, {
        position: {
          x: Math.max(0, Math.round(newX / 20) * 20), // Snap to grid
          y: Math.max(0, Math.round(newY / 20) * 20),
        },
      });
    } else if (isPanning && canvasRef.current) {
      setPan({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      });
    } else if (isConnecting && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      setConnectLine(prev => prev ? {
        ...prev,
        end: {
          x: (e.clientX - rect.left - pan.x) / zoom,
          y: (e.clientY - rect.top - pan.y) / zoom,
        },
      } : null);
    }
  }, [isDragging, dragNodeId, dragOffset, pan, zoom, isPanning, panStart, isConnecting, onUpdateNode]);

  // Handle mouse up (end drag or pan)
  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setDragNodeId(null);
    setIsPanning(false);
    setIsConnecting(false);
    setConnectFrom(null);
    setConnectLine(null);
  }, []);

  // Handle canvas click (deselect node or start panning)
  const handleCanvasMouseDown = useCallback((e: React.MouseEvent) => {
    // Middle mouse button for panning
    if (e.button === 1 || e.altKey) {
      e.preventDefault();
      setIsPanning(true);
      setPanStart({
        x: e.clientX - pan.x,
        y: e.clientY - pan.y,
      });
    }
  }, [pan]);

  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    // Only deselect if clicking on canvas background
    if (e.target === canvasRef.current) {
      onSelectNode(null);
    }
  }, [onSelectNode]);

  // Handle connection start
  const handleConnect = useCallback((nodeId: string) => {
    if (isConnecting && connectFrom) {
      // Complete connection
      if (nodeId !== connectFrom) {
        onAddEdge(connectFrom, nodeId);
      }
      setIsConnecting(false);
      setConnectFrom(null);
      setConnectLine(null);
    } else {
      // Start connection
      const node = workflow.nodes.find(n => n.id === nodeId);
      if (node && canvasRef.current) {
        setIsConnecting(true);
        setConnectFrom(nodeId);
        setConnectLine({
          start: {
            x: node.position.x + 100, // Center of node
            y: node.position.y + 60, // Bottom of node
          },
          end: {
            x: node.position.x + 100,
            y: node.position.y + 60,
          },
        });
      }
    }
  }, [isConnecting, connectFrom, onAddEdge, workflow.nodes]);

  // Handle zoom
  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      setZoom(prev => Math.min(2, Math.max(0.25, prev * delta)));
    }
  }, []);

  // Calculate edge path between two nodes
  const getEdgePath = useCallback((edge: WorkflowEdge) => {
    const source = workflow.nodes.find(n => n.id === edge.sourceId);
    const target = workflow.nodes.find(n => n.id === edge.targetId);
    
    if (!source || !target) return '';

    // Calculate connection points
    const sourceX = source.position.x + 100; // Node center
    const sourceY = source.position.y + 80; // Node bottom
    
    // For condition nodes, offset based on handle type
    let sourceXOffset = 0;
    if (source.type === 'condition' && edge.sourceHandle) {
      sourceXOffset = edge.sourceHandle === 'true' ? -45 : 45;
    }

    const targetX = target.position.x + 100; // Node center
    const targetY = target.position.y; // Node top

    // Create curved path
    const midY = (sourceY + targetY) / 2;
    
    return `M ${sourceX + sourceXOffset} ${sourceY} 
            C ${sourceX + sourceXOffset} ${midY}, 
              ${targetX} ${midY}, 
              ${targetX} ${targetY}`;
  }, [workflow.nodes]);

  return (
    <div
      ref={canvasRef}
      className={cn(
        'relative overflow-hidden bg-muted/30 rounded-lg border',
        'bg-[radial-gradient(circle,#e5e5e5_1px,transparent_1px)]',
        '[background-size:20px_20px]',
        isConnecting && 'cursor-crosshair',
        className
      )}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onMouseDown={handleCanvasMouseDown}
      onClick={handleCanvasClick}
      onWheel={handleWheel}
    >
      {/* Zoom controls */}
      <div className="absolute top-3 right-3 z-20 flex items-center gap-2 bg-background/90 backdrop-blur-sm rounded-md border px-2 py-1">
        <button
          className="w-6 h-6 flex items-center justify-center hover:bg-muted rounded text-muted-foreground hover:text-foreground"
          onClick={() => setZoom(prev => Math.min(2, prev + 0.1))}
        >
          +
        </button>
        <span className="text-xs text-muted-foreground w-10 text-center">
          {Math.round(zoom * 100)}%
        </span>
        <button
          className="w-6 h-6 flex items-center justify-center hover:bg-muted rounded text-muted-foreground hover:text-foreground"
          onClick={() => setZoom(prev => Math.max(0.25, prev - 0.1))}
        >
          −
        </button>
        <button
          className="ml-2 px-2 py-0.5 text-xs hover:bg-muted rounded text-muted-foreground hover:text-foreground"
          onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }}
        >
          Reset
        </button>
      </div>

      {/* Pan/Zoom container */}
      <div
        className="absolute inset-0"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px)`,
        }}
      >
        {/* SVG for edges */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{
            transform: `scale(${zoom})`,
            transformOrigin: 'top left',
          }}
        >
          <defs>
            <marker
              id="arrowhead"
              markerWidth="10"
              markerHeight="7"
              refX="9"
              refY="3.5"
              orient="auto"
            >
              <polygon
                points="0 0, 10 3.5, 0 7"
                fill="currentColor"
                className="text-muted-foreground"
              />
            </marker>
          </defs>
          
          {/* Render edges */}
          {workflow.edges.map(edge => (
            <g key={edge.id}>
              <path
                d={getEdgePath(edge)}
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                className="text-muted-foreground"
                markerEnd="url(#arrowhead)"
              />
              {edge.label && (
                <text
                  className="text-[10px] fill-muted-foreground"
                  textAnchor="middle"
                >
                  <textPath href={`#edge-${edge.id}`} startOffset="50%">
                    {edge.label}
                  </textPath>
                </text>
              )}
            </g>
          ))}

          {/* Connection line while dragging */}
          {isConnecting && connectLine && (
            <line
              x1={connectLine.start.x}
              y1={connectLine.start.y}
              x2={connectLine.end.x}
              y2={connectLine.end.y}
              stroke="currentColor"
              strokeWidth={2}
              strokeDasharray="5,5"
              className="text-primary"
            />
          )}
        </svg>

        {/* Render nodes */}
        {workflow.nodes.map(node => (
          <WorkflowNode
            key={node.id}
            node={node}
            isSelected={node.id === selectedNodeId}
            onSelect={onSelectNode}
            onDragStart={handleDragStart}
            onConnect={handleConnect}
            scale={zoom}
          />
        ))}
      </div>

      {/* Empty state */}
      {workflow.nodes.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <p className="text-sm">No steps in this workflow yet.</p>
            <p className="text-xs mt-1">Add a trigger from the toolbar to get started.</p>
          </div>
        </div>
      )}
    </div>
  );
}
