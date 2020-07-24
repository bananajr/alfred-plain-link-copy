ObjC.import('AppKit');

function run(argv) {
  var browsers = [
    { name: "Google Chrome",
      fn: function(app) {
        var tab = app.windows[0].activeTab;
        return { url: tab.url(), title: tab.title() };
      }
    },
    { name: "Safari",
      fn: function(app) {
        var tab = app.windows[0].currentTab;
        return { url: tab.url(), title: tab.name() };
      }
    }
  ];

  const frontAppName = Application('System Events').applicationProcesses.where({ frontmost: true }).name()[0]

  for (const browser of browsers) {
    if (browser.name !== frontAppName) {
      continue;
    }
    var app = Application(frontAppName);
    if (!app.running()) {
      continue;
    }
    var res = browser.fn(app);
    console.log(res.title);
    console.log(res.url);
    if (res.hasOwnProperty('title') && res.hasOwnProperty('url')) {
      copyToClipboard(res.url, res.title);
      return res.title + ' - ' + res.url;
    }
  }
  return 'FAIL';
}



function copyToClipboard(url, title) {

  var htmlStr = '<a href="' + url + '">' + title +'</a>';
  var mdStr   = '[' + title + '](' + url + ')';
  var rtfStr  = '{\\rtf1\\ansi\deff0{\\field{\\*\\fldinst{HYPERLINK "' + url + '"}}{\\fldrslt ' + title + '}}}';

  // remove this if you don't want the domain appended in parenthesis
  var domainStr = url.replace('http://','').replace('https://','').split(/[/?#]/)[0];
  domainStr = ' (' + domainStr + ')';
  htmlStr += domainStr;
  mdStr   += domainStr;
  rtfStr  += domainStr;

  var pb = $.NSPasteboard.generalPasteboard;
  pb.clearContents;
  pb.setStringForType($(mdStr),   $.NSPasteboardTypeString);
  pb.setStringForType($(htmlStr), $.NSPasteboardTypeHTML);
  pb.setStringForType($(rtfStr) , $.NSPasteboardTypeRTF);
}
