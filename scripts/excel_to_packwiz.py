#!/usr/bin/env python3
"""
Read a multi-sheet Excel file and run a shell command for each value in
column G (skipping the first row, e.g. a header), for every sheet.

Usage:
    python excel_to_packwiz.py data.xlsx --command "./process.sh {value}"
    python excel_to_packwiz.py data.xlsx --sheet "Orders" --command "echo {value}" --dry-run
    python excel_to_packwiz.py data.xlsx --all-sheets --column G --skip-rows 1 --command "ingest.sh {value}"

The --command template uses a single {value} placeholder, filled in with
each cell's content. The template is split into argv tokens BEFORE
substitution and the resulting command is run without a shell
(subprocess.run([...])), so values coming from spreadsheet cells are passed
as literal arguments and can't be used to inject extra shell commands (e.g.
a cell containing "; rm -rf /" is treated as plain text, not executed).
"""

import argparse
import shlex
import string
import subprocess
import sys

import pandas as pd


def col_letter_to_index(letter: str) -> int:
    """'A' -> 0, 'G' -> 6, 'AA' -> 26, etc."""
    letter = letter.strip().upper()
    idx = 0
    for ch in letter:
        idx = idx * 26 + (string.ascii_uppercase.index(ch) + 1)
    return idx - 1


def build_command(template: str, value) -> list[str]:
    tokens = shlex.split(template)
    filled = []
    for tok in tokens:
        try:
            filled.append(tok.format(value=value))
        except KeyError as e:
            raise KeyError(f"placeholder {e} not found; only {{value}} is available")
    return filled


def run_for_sheet(values, sheet_name: str, template: str,
                   dry_run: bool, stop_on_error: bool) -> int:
    failures = 0
    for i, value in enumerate(values):
        if pd.isna(value):
            print(f"[{sheet_name} row {i}] SKIPPED: empty cell", file=sys.stderr)
            continue
        try:
            cmd = build_command(template, value)
        except KeyError as e:
            print(f"[{sheet_name} row {i}] SKIPPED: {e}", file=sys.stderr)
            failures += 1
            continue

        print(f"[{sheet_name} row {i}] {' '.join(shlex.quote(c) for c in cmd)}")
        if dry_run:
            continue

        result = subprocess.run(cmd, capture_output=True, text=True)
        if result.stdout:
            print(result.stdout, end="")
        if result.stderr:
            print(result.stderr, end="", file=sys.stderr)
        if result.returncode != 0:
            failures += 1
            print(f"[{sheet_name} row {i}] exited with {result.returncode}", file=sys.stderr)
            if stop_on_error:
                break
    return failures


def main():
    parser = argparse.ArgumentParser(
        description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("excel_file", help="Path to the .xlsx file")
    sheet_group = parser.add_mutually_exclusive_group()
    sheet_group.add_argument("--sheet", help="Name of a single sheet to use (default: first sheet)")
    sheet_group.add_argument("--all-sheets", action="store_true",
                              help="Run the command for every sheet in the file")
    parser.add_argument("--column", default="G", help="Excel column letter to read values from (default: G)")
    parser.add_argument("--skip-rows", type=int, default=1,
                         help="Number of leading rows to skip, e.g. a header row (default: 1)")
    parser.add_argument("--command", required=True,
                         help='Command template using {value}, e.g. "./process.sh {value}"')
    parser.add_argument("--dry-run", action="store_true", help="Print commands without executing them")
    parser.add_argument("--stop-on-error", action="store_true",
                         help="Stop a sheet's processing on the first failed command")
    args = parser.parse_args()

    col_idx = col_letter_to_index(args.column)

    if args.all_sheets:
        raw_sheets = pd.read_excel(args.excel_file, sheet_name=None, header=None)
    elif args.sheet:
        raw_sheets = {args.sheet: pd.read_excel(args.excel_file, sheet_name=args.sheet, header=None)}
    else:
        xls = pd.ExcelFile(args.excel_file)
        first = xls.sheet_names[0]
        raw_sheets = {first: pd.read_excel(args.excel_file, sheet_name=first, header=None)}

    total_failures = 0
    for name, df in raw_sheets.items():
        values = df.iloc[args.skip_rows:, col_idx].tolist()
        print(f"=== Sheet: {name} ({len(values)} rows after skipping {args.skip_rows}) ===")
        total_failures += run_for_sheet(values, name, args.command, args.dry_run, args.stop_on_error)

    if total_failures:
        print(f"\n{total_failures} command(s) failed.", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
