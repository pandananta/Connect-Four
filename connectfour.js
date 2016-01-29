
(function($){
	var RUBRIC = [],
		WINNINGPATHSIZE = 4,
		BOARDWIDTH = 7,
		BOARDHEIGHT = 6,
		BOARD = [],
		BLACK = 0, 
		RED = 1,
		SCORECARDS = {},
		columnHeight = [],
		player = BLACK,
		gameOver = false;

	var generateRubric = function () {
		//for every cell, find all winning paths in every direction
		for (var i = 0; i < BOARDWIDTH * BOARDHEIGHT; i++) { 
			var vertical = directionalRubric(i, BOARDWIDTH), 
				horizontal = directionalRubric(i, 1),
				diagonalUp = directionalRubric(i, BOARDWIDTH+1),
				diagonalDown = directionalRubric(i, BOARDWIDTH-1);

			RUBRIC[i] = $.merge( $.merge( $.merge( vertical, horizontal ), diagonalUp ), diagonalDown);
		}
	}

	var directionalRubric = function (cellNum, offset) {
		var dr = [],
			cell,
			path,
			maxDistance = WINNINGPATHSIZE-1,
			minPoint = cellNum - (maxDistance * offset);

		for (var start = minPoint; start <= cellNum; start += offset) {
			path = [];
			for (var i = 0; i < WINNINGPATHSIZE; i += 1) {
				cell = start + (i * offset);

				if (isInBounds(cell) && (i === 0 || i === WINNINGPATHSIZE-1 || !isEdge(cell))) {
					path.push(cell);
				} else {
					break;
				}
			}
			if (path.length === WINNINGPATHSIZE) dr.push(path);
		}
		return dr;
	}

	var isEdge = function (cell) {
		return cell%BOARDWIDTH === 0 || cell%BOARDWIDTH === BOARDWIDTH-1;
	}

	var isInBounds = function (cell) {
		return cell >= 0 && cell < BOARDWIDTH*BOARDHEIGHT;
	}

	var hasWinningPath = function (cellNum, cellList) {
		$.each( RUBRIC[cellNum], function( index, path ) {
		 	$.each( path, function( i, cell ) {
		 		console.log(cell);
		     	if($.inArray(cell, cellList) == -1) return false;
		     	if (i == path.length-1) {
					console.log("OMGGGGGGG YOU WON");
					gameOver = true;
				}
		     	return true;
		  	});
		});
		return false;
	}

	var initialize = function() {
		var $newRow = $('<div class="row">'),
			$newCell;
		SCORECARDS[BLACK] = [];
		SCORECARDS[RED] = [];
		$('.board').empty();
		for (var i = 0; i < BOARDWIDTH * BOARDHEIGHT; i++) { 
			BOARD[i] = -1;
			$newCell = $('<div class="cell">');
			$newCell.attr('data-cell', i);
			if (i < BOARDWIDTH) {
	        	$newCell.addClass('selectable');
	        	columnHeight[i] = 0;
	        }
			$newCell.on('click', function(e) {
	        	var node = $(e.target)
	        		cellNum = $(e.target).data("cell"), 
	        		rowNum = Math.floor(cellNum/BOARDWIDTH),
	        		colNum = cellNum%BOARDWIDTH;

	        		console.log(cellNum);

        		if (!gameOver && columnHeight[colNum] == rowNum) {
        			node.addClass(player ? 'red' : 'black').removeClass('selectable');
        			SCORECARDS[player].push(cellNum);
        			columnHeight[colNum] += 1;

        			if (SCORECARDS[player].length > 3) {
        				if (hasWinningPath(cellNum, SCORECARDS[player])) {
        					console.log("OMGGGGGGG YOU WON");
        				}
        			}

        			$('[data-cell=' + (cellNum + BOARDWIDTH) + ']').addClass('selectable');
        			player = 1 - player;
        		}
	        });
	        $newRow.append($newCell);
	        if (i%BOARDWIDTH === BOARDWIDTH-1)  {
        		$('.board').prepend($newRow);
        		$newRow = $('<div class="row">');
	        }
		}
	    
	};

	$('.restart').on('click', initialize);

	generateRubric();
	console.log(RUBRIC);
	initialize();
})(jQuery)



