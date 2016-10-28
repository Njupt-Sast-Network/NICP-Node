import xlwt
import sys
import json

workbook = xlwt.Workbook()
sheet1 = workbook.add_sheet('sheet1',cell_overwrite_ok=False)

dataJson=input()
datas=json.loads(dataJson)

for i,data in enumerate(datas):
    sheet1.write(data['x'],data['y'],data['value'])

workbook.save(sys.argv[1])