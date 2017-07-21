
(function(){
	var BD = {
		stop: '[。．，、：；！‼？\u2047]',
		open: '[「『“‘（《〈【〖〔［｛]',
		close: '[」』”’）》〉】〗〕］｝]',
		sep: '[·\u2027]'
	};

	var fixRules = [
		BD.stop + BD.close,
		BD.close + BD.stop,
		BD.stop + BD.open,
		BD.close + BD.open,
		BD.open + '{2,}',
		BD.close + '{2,}'
	];
	var fixRulesAll = new RegExp(fixRules.join('|'), 'g');

	function fixBD(node){
		var walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT, {
			acceptNode: function(node){
				if(node.nodeValue.trim()==""){
					return NodeFilter.FILTER_SKIP;
				}
				if(fixRulesAll.test(node.nodeValue)){
					return NodeFilter.FILTER_ACCEPT;
				}
				return NodeFilter.FILTER_SKIP;
			}
		}, false);
		var n, reg, match, indexes, ranges;
		var docRange = document.createRange();
		while(n = walker.nextNode()){
			if(n.parentNode.className == 'halfwidth'){
				continue;
			}
			indexes = {};
			fixRules.forEach(function(pattern){
				reg = new RegExp(pattern, 'g');
				match = reg.exec(n.nodeValue);
				while(match){
					indexes[match.index] = match.index + match[0].length;
					match = reg.exec(n.nodeValue);
				}
			});
			ranges = Object.keys(indexes).length == 1? indexes: {};
			Object.keys(indexes).sort(function(a, b){
				return a - b;
			}).reduce(function(a, b){
				if(!(a in ranges)){
					ranges[a] = indexes[a];
				}
				if(b <= ranges[a]){
					ranges[a] = indexes[b];
					return a;
				} else {
					ranges[b] = indexes[b];
					return b;
				}
			});

			var _wrapper = document.createElement('i');
			_wrapper.className = 'halfwidth';
			var wrapper;
			Object.keys(ranges).sort(function(a, b){
				return b - a;
			}).forEach(function(start){
				docRange.setStart(n, start);
				docRange.setEnd(n, ranges[start]);
				wrapper = _wrapper.cloneNode(false);
				wrapper.appendChild(docRange.extractContents());
				docRange.insertNode(wrapper);
			});
		}
	}

	fixBD(document.body);
})();


