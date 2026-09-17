import { useCallback, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import Box from "@mui/material/Box";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import TablePagination from "@mui/material/TablePagination";
import Typography from "@mui/material/Typography";
import DeleteIcon from "@mui/icons-material/Delete";
import SettingsIcon from "@mui/icons-material/Settings";
import { useI18n } from "../../../lib/i18n/useI18n";
import { AppButton } from "../../../shared/components/AppButton";
import { computeColumnWidths, getTableFont } from "../columnWidth";
import {
  defaultVisibleColumns,
  getColumnDisplayText,
  trainingDataColumns,
  type TrainingDataColumnDefinition,
  type TrainingDataColumnKey,
} from "../trainingDataColumns";
import type { EditableTrainingDataField, TrainingDataListItem } from "../trainingData.types";
import { DurationCell } from "./DurationCell";
import { EditableNumberCell } from "./EditableNumberCell";
import { TrainingDataSettingsPanel, type TrainingDataDisplayMode } from "./TrainingDataSettingsPanel";
import { WorkoutIntensityCell } from "./WorkoutIntensityCell";

type UpdateItemFn = (id: number, patch: Partial<Pick<TrainingDataListItem, EditableTrainingDataField>>) => void;

type TrainingDataTableProps = {
  items: TrainingDataListItem[];
  totalCount: number;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  onUpdateItem: UpdateItemFn;
  onDeleteItem: (id: number) => void;
};

const actionsColumnWidth = 56;
const minViewportHeight = 240;
const bottomReservedPx = 72; // space for TablePagination below the scroll container
const rowHeightByDisplayMode: Record<TrainingDataDisplayMode, number> = { default: 52, compact: 36 };

const isRightAlignedColumn = (column: TrainingDataColumnDefinition): boolean =>
  column.kind === "number" || column.kind === "duration";

export function TrainingDataTable({
  items,
  totalCount,
  page,
  pageSize,
  onPageChange,
  onPageSizeChange,
  onUpdateItem,
  onDeleteItem,
}: TrainingDataTableProps) {
  const { getResource } = useI18n();
  const [visibleColumns, setVisibleColumns] = useState<Set<TrainingDataColumnKey>>(
    () => new Set(defaultVisibleColumns),
  );
  const [displayMode, setDisplayMode] = useState<TrainingDataDisplayMode>("default");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(480);

  // Horizontal scroll (visible scrollbar) and vertical scroll (hidden scrollbar) are split across
  // two nested boxes rather than one - a single overflow:auto box has no way to show a scrollbar
  // for only one axis.
  const outerContainerRef = useRef<HTMLDivElement | null>(null);
  const innerContainerRef = useRef<HTMLDivElement | null>(null);
  const rowHeight = rowHeightByDisplayMode[displayMode];

  // Measured once via ResizeObserver rather than relying on CSS width:100%, which can resolve
  // inconsistently between this row's position:sticky header, the position:relative row wrapper
  // and each position:absolute row - an explicit shared pixel width guarantees they always match.
  const measureOuterContainer = useCallback((element: HTMLDivElement | null) => {
    outerContainerRef.current = element;

    if (!element) {
      return;
    }

    setContainerWidth(element.clientWidth);
    setViewportHeight(Math.max(minViewportHeight, window.innerHeight - element.getBoundingClientRect().top - bottomReservedPx));
  }, []);

  const hasRows = items.length > 0;

  useLayoutEffect(() => {
    const element = outerContainerRef.current;

    if (!element || typeof ResizeObserver === "undefined") {
      return;
    }

    const resizeObserver = new ResizeObserver(() => setContainerWidth(element.clientWidth));
    resizeObserver.observe(element);

    const handleWindowResize = (): void => {
      setViewportHeight(Math.max(minViewportHeight, window.innerHeight - element.getBoundingClientRect().top - bottomReservedPx));
    };
    window.addEventListener("resize", handleWindowResize);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", handleWindowResize);
    };
  }, [hasRows]);

  const toggleColumn = (key: TrainingDataColumnKey): void => {
    setVisibleColumns((current) => {
      const next = new Set(current);

      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }

      return next;
    });
  };

  const setColumnsVisible = (keys: TrainingDataColumnKey[], visible: boolean): void => {
    setVisibleColumns((current) => {
      const next = new Set(current);

      for (const key of keys) {
        if (visible) {
          next.add(key);
        } else {
          next.delete(key);
        }
      }

      return next;
    });
  };

  const visibleColumnDefs = trainingDataColumns.filter((column) => visibleColumns.has(column.key));

  const columnWidths = useMemo(
    () => computeColumnWidths(visibleColumnDefs, items, getResource, getTableFont()),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [items, visibleColumns, getResource],
  );

  const totalWidth =
    visibleColumnDefs.reduce((sum, column) => sum + (columnWidths[column.key] ?? 0), 0) + actionsColumnWidth;
  // Never below each column's content-based width (would silently clip values) - the table fills
  // the container when columns fit, and only then does the container scroll horizontally.
  const renderedWidth = Math.max(totalWidth, containerWidth);

  const rowVirtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => innerContainerRef.current,
    estimateSize: () => rowHeight,
    overscan: 10,
  });

  // react-virtual caches measured row sizes and only re-reads estimateSize for rows it hasn't
  // measured yet - switching display mode must force it to recompute every already-cached row.
  useLayoutEffect(() => {
    rowVirtualizer.measure();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rowHeight]);

  return (
    <Paper sx={{ minWidth: 0 }}>
      <Stack direction="row" sx={{ justifyContent: "flex-end", alignItems: "center", p: 1 }}>
        <IconButton onClick={() => setIsSettingsOpen(true)} aria-label={getResource("common.tableSettingsTitle")}>
          <SettingsIcon />
        </IconButton>
      </Stack>

      <TrainingDataSettingsPanel
        open={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        visibleColumns={visibleColumns}
        onToggleColumn={toggleColumn}
        onSetColumnsVisible={setColumnsVisible}
        displayMode={displayMode}
        onDisplayModeChange={setDisplayMode}
      />

      {items.length === 0 ? (
        <Typography sx={{ p: 2 }}>{getResource("common.trainingDataEmpty")}</Typography>
      ) : (
        <Box ref={measureOuterContainer} sx={{ overflowX: "auto" }}>
        <Box
          ref={innerContainerRef}
          role="table"
          sx={{
            // Must match the header/rows' own width - otherwise this box just fills the outer
            // container at 100% and silently clips its overflowing children instead of letting
            // that overflow bubble up to the outer box, which is the one that actually scrolls
            // horizontally.
            width: renderedWidth,
            overflowX: "hidden",
            overflowY: "auto",
            maxHeight: viewportHeight,
            scrollbarWidth: "none",
            msOverflowStyle: "none",
            "&::-webkit-scrollbar": { display: "none" },
          }}
        >
          <Box
            role="row"
            sx={{
              display: "flex",
              width: renderedWidth,
              position: "sticky",
              top: 0,
              zIndex: 1,
              // Must be fully opaque (not a translucent action.* overlay) - scrolled rows sit
              // directly beneath this sticky header and would otherwise bleed through it.
              backgroundColor: "background.default",
              borderBottom: 2,
              borderColor: "divider",
            }}
          >
            {visibleColumnDefs.map((column) => (
              <Box
                role="columnheader"
                key={column.key}
                sx={{
                  width: columnWidths[column.key],
                  flexShrink: 0,
                  px: 1,
                  py: 1.25,
                  textAlign: isRightAlignedColumn(column) ? "right" : "left",
                }}
              >
                <Typography variant="subtitle2" color="text.secondary" noWrap>
                  {getResource(column.labelKey)}
                </Typography>
              </Box>
            ))}
            <Box role="columnheader" sx={{ width: actionsColumnWidth, flexShrink: 0 }} />
          </Box>

          <Box sx={{ position: "relative", width: renderedWidth, height: rowVirtualizer.getTotalSize() }}>
            {rowVirtualizer.getVirtualItems().map((virtualRow) => {
              const item = items[virtualRow.index];

              return (
                <Box
                  role="row"
                  key={item.id}
                  sx={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: renderedWidth,
                    height: virtualRow.size,
                    display: "flex",
                    alignItems: "center",
                    transform: `translateY(${virtualRow.start}px)`,
                    borderBottom: 1,
                    borderColor: "divider",
                    backgroundColor: virtualRow.index % 2 === 1 ? "action.hover" : "transparent",
                    "&:hover": { backgroundColor: "action.selected" },
                  }}
                >
                  {visibleColumnDefs.map((column) => (
                    <Box
                      role="cell"
                      key={column.key}
                      sx={{
                        width: columnWidths[column.key],
                        flexShrink: 0,
                        px: 1,
                        textAlign: isRightAlignedColumn(column) ? "right" : "left",
                      }}
                    >
                      <TrainingDataCell column={column} item={item} onUpdateItem={onUpdateItem} getResource={getResource} />
                    </Box>
                  ))}
                  <Box role="cell" sx={{ width: actionsColumnWidth, flexShrink: 0, textAlign: "center" }}>
                    <IconButton
                      size="small"
                      aria-label={getResource("common.deleteTrainingDataRecord")}
                      onClick={() => setPendingDeleteId(item.id)}
                      sx={{ color: "text.secondary", "&:hover": { color: "error.main" } }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>
              );
            })}
          </Box>
        </Box>
        </Box>
      )}

      <TablePagination
        component="div"
        count={totalCount}
        page={page}
        rowsPerPage={pageSize}
        onPageChange={(_event, nextPage) => onPageChange(nextPage)}
        onRowsPerPageChange={(event) => onPageSizeChange(Number(event.target.value))}
      />

      <Dialog open={pendingDeleteId !== null} onClose={() => setPendingDeleteId(null)}>
        <DialogTitle>{getResource("common.deleteConfirmTitle")}</DialogTitle>
        <DialogContent>
          <DialogContentText>{getResource("common.deleteConfirmMessage")}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <AppButton onClick={() => setPendingDeleteId(null)}>
            {getResource("common.cancel")}
          </AppButton>
          <AppButton
            color="error"
            onClick={() => {
              if (pendingDeleteId !== null) {
                onDeleteItem(pendingDeleteId);
              }

              setPendingDeleteId(null);
            }}
          >
            {getResource("common.delete")}
          </AppButton>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}

type TrainingDataCellProps = {
  column: TrainingDataColumnDefinition;
  item: TrainingDataListItem;
  onUpdateItem: UpdateItemFn;
  getResource: (key: string) => string;
};

function TrainingDataCell({ column, item, onUpdateItem, getResource }: TrainingDataCellProps) {
  if (column.kind === "workoutIntensity") {
    return (
      <WorkoutIntensityCell
        value={item.workoutIntensity}
        onCommit={(value) => onUpdateItem(item.id, { workoutIntensity: value })}
      />
    );
  }

  if (column.kind === "duration") {
    const key = column.key as EditableTrainingDataField;

    return (
      <DurationCell
        value={item[key] as number | null}
        onCommit={(value) => onUpdateItem(item.id, { [key]: value })}
      />
    );
  }

  if (column.kind === "number") {
    const key = column.key as EditableTrainingDataField;
    const scale = column.unitScale ?? 1;
    const rawValue = item[key] as number | null;
    const displayValue = rawValue === null ? null : rawValue * scale;

    return (
      <EditableNumberCell
        value={displayValue}
        decimalPlaces={column.decimalPlaces}
        onCommit={(value) => onUpdateItem(item.id, { [key]: value === null ? null : value / scale })}
      />
    );
  }

  return <Typography variant="body2">{getColumnDisplayText(item, column, getResource)}</Typography>;
}
