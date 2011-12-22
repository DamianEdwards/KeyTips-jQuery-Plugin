tools\AjaxMin.exe src\jquery.KeyTips.js -o src\jquery.KeyTips.min.js -clobber
tools\AjaxMin.exe src\styles\KeyTips.css -o src\styles\KeyTips.min.css -clobber
.nuget\nuget.exe pack jquery.keytips.nuspec -OutputDirectory artifacts
