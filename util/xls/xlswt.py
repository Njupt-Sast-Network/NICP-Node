import xlwt
import sys
import json

workbook = xlwt.Workbook()
sheet1 = workbook.add_sheet('sheet1',cell_overwrite_ok=False)

dataJson=input()
data=json.loads(dataJson)

for i,row in  enumerate(data):
    for j,cell in enumerate(row):
        sheet1.write(i,j,cell)

workbook.save(sys.argv[1])