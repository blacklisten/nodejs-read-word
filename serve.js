const admZip = require('adm-zip')
const fs = require('fs')
const path = require('path')

const filePath = './docs/9608_s15_qp_11.docx'
const resultList = []

fs.exists(filePath, (exists) => {
  if (exists) {
    const zip = new admZip(filePath)
    zip.extractAllTo("./result", /*overwrite*/true);

    const contentXml = zip.readAsText('word/document.xml')
    // 正则匹配出对应的<w:p>里面的内容,方法是先匹配<w:p>,再匹配里面的<w:t>,将匹配到的加起来即可
    // 注意？表示非贪婪模式(尽可能少匹配字符)，否则只能匹配到一个<w:p></w:p>
    var matchedWP = contentXml.match(/<w:p.*?>.*?<\/w:p>/gi)
			//继续匹配每个<w:p></w:p>里面的<w:t>,这里必须判断matchedWP存在否则报错
    if(matchedWP){
      matchedWP.forEach(function(wpItem){
        // 注意这里<w:t>的匹配，有可能是<w:t xml:space="preserve">这种格式，需要特殊处理
        var matchedWT = wpItem.match(/(<w:t>.*?<\/w:t>)|(<w:t\s.[^>]*?>.*?<\/w:t>)/gi)
        var textContent = ''
        if(matchedWT){
          matchedWT.forEach(function(wtItem){
            //如果不是<w:t xml:space="preserve">格式
            if(wtItem.indexOf('xml:space')===-1){
              textContent+=wtItem.slice(5,-6);
            }else{
              textContent+=wtItem.slice(26,-6);
            }
          });
          resultList.push(textContent)
        }
      })
      //解析完成    
      console.log(resultList)
    } else {
      console.log(resultList, '---')
    }
  }
})