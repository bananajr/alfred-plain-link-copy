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
    var p = browser.fn(app);
    console.log(p.title);
    console.log(p.url);
    if (p.hasOwnProperty('title') && p.hasOwnProperty('url')) {
      p = customize(p);
      copyToClipboard(p);
      return p.title + ' - ' + p.url;
    }
  }
  return 'FAIL';
}


function customize(p) {
  var sourceIndex = p.title.lastIndexOf(' - ');
  if (sourceIndex < 0) {
     sourceIndex = p.title.lastIndexOf(' | ');
  }
  if (sourceIndex >= 0) {
    p.source = p.title.substr(sourceIndex + 3);
    p.title = p.title.substr(0, sourceIndex);
  }
  else {
    p.source = p.url.replace('http://','').replace('https://','').split(/[/?#]/)[0];
    var dcomps = p.source.split('.');
    if (dcomps.length > 2) {
      dcomps = dcomps.slice(-2);
      console.log('dcomps length = ', dcomps.length);
    }
    p.source = dcomps.join('.');
  }
  return p;
}


function copyToClipboard(p) {
  var htmlStr = '<a href="' + p.url + '">' + p.title +'</a>';
  var mdStr   = '[' + p.title + '](' + p.url + ')';
  var rtfStr  = '{\\rtf1\\ansi\deff0{\\field{\\*\\fldinst{HYPERLINK "' + p.url +
                '"}}{\\fldrslt ' + p.title + '}}}';

  if (p.hasOwnProperty('source')) {
	var sourceStr = ' (' + p.source + ')';
    htmlStr += sourceStr;
    mdStr   += sourceStr;
    rtfStr  += sourceStr;
  }

  var pb = $.NSPasteboard.generalPasteboard;
  pb.clearContents;
  pb.setStringForType($(mdStr),   $.NSPasteboardTypeString);
  pb.setStringForType($(htmlStr), $.NSPasteboardTypeHTML);
  pb.setStringForType($(rtfStr) , $.NSPasteboardTypeRTF);
}
