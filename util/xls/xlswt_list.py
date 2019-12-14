import xlwt
import sys
import json

workbook = xlwt.Workbook()
sheet1 = workbook.add_sheet('sheet1',cell_overwrite_ok=False)

dataJson=input()
datas = json.loads(dataJson)
rows = 0
judgerDict = {}

style = xlwt.XFStyle()

al = xlwt.Alignment()
al.horz = 0x02 
al.vert = 0x01

style.alignment = al

borders = xlwt.Borders()
borders.left = xlwt.Borders.THIN
borders.right = xlwt.Borders.THIN
borders.top = xlwt.Borders.THIN
borders.bottom = xlwt.Borders.THIN
borders.left_colour = 0x00
borders.right_colour = 0x00
borders.top_colour = 0x00
borders.bottom_colour = 0x00

style.borders = borders

for i,data in enumerate(datas):
    if data['x']==0:
        rows += 1
        judgerDict[data['y']] = data['value']

judger = (rows - 5) // 2

for i, data in enumerate(datas):
    if data['x']!=0 or (data['x']==0 and (data['y']<4 or data['y']>=rows-1)):
        sheet1.write(data['x'], data['y'], data['value'], style)    

for i in range(0, judger):
    sheet1.write_merge(0, 0, 4 + i * 2, 5 + i * 2, judgerDict[4 + i * 2], style)

workbook.save(sys.argv[1])