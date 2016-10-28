import xlrd
import sys
import json

workbook = xlrd.open_workbook(sys.argv[1])
sheet = workbook.sheet_by_index(0)
output = []
for row in range(sheet.nrows):
    output.append(sheet.row_values(row))
print(json.dumps(output))
