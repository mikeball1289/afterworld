mkdir %1
\cygwin64\bin\convert %1.png -crop 4x8@ -set filename:tile "%%[fx:page.y/128]-%%[fx:page.x/256]" +repage +adjoin %1/%%[filename:tile].png
"\Program Files\CodeAndWeb\TexturePacker\bin\TexturePacker.exe" --format json --data out/%1.json --sheet out/%1.png --trim-sprite-names --algorithm MaxRects --disable-rotation ./%1