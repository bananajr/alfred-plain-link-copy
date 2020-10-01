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
    },
    { name: "firefox",
      fn: function(app) {
	    var win = app.windows[0];
        var url = getURLFromFirefox(app);
        if (url) {
	        return { url: url, title: win.name() };
        }
        return { }
	  }
    }
  ];

  var doCustomize = (argv[0] !== '0');

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
      if (doCustomize) {
      	p = customize(p);
      }
      copyToClipboard(p);
      return p.title + ' - ' + p.url;
    }
  }
  return 'FAIL';
}


function customize(p) {
  var sourceIndex = p.title.lastIndexOf(' | ');
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
  var sourceStr = '';
  if (p.hasOwnProperty('source')) {
	var sourceStr = ' (' + p.source + ')';
  }

  var htmlStr = '<a href="' + p.url + '">' + p.title +'</a>' + sourceStr;
  var mdStr   = '[' + p.title + '](' + p.url + ')' + sourceStr;
  var rtfStr  = '{\\rtf1\\ansi\deff0{\\field{\\*\\fldinst{HYPERLINK "' + p.url +
                '"}}{\\fldrslt ' + p.title + '}}' + sourceStr + '}';

  var pb = $.NSPasteboard.generalPasteboard;
  pb.clearContents;
  pb.setStringForType($(mdStr),   $.NSPasteboardTypeString);
  pb.setStringForType($(htmlStr), $.NSPasteboardTypeHTML);
  pb.setStringForType($(rtfStr) , $.NSPasteboardTypeRTF);
}


function getURLFromFirefox(app) {
  var pb = $.NSPasteboard.generalPasteboard;
  var pbcount = pb.changeCount;
  
  var se = Application('System Events');
  se.keystroke('l', { using: 'command down' });
  delay(0.1);
  se.keystroke('c', { using: 'command down' });
  delay(0.1);
  se.keyCode(53); // escape

  for (var count = 0; count < 20; ++count) {
	if (pb.changeCount != pbcount) {
      console.log("pasteboard changed");
      var url = ObjC.unwrap(pb.stringForType($.NSPasteboardTypeString));
	  console.log(url);
      return url;
    }
    delay(0.1)
  }
  console.log("pasteboard never changed");
  return null;
}
