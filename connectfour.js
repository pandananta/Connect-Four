
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
		player,
		gameOver;

	var generateRubric = function () {
		//for every cell, find all winning paths in every direction
		for (var i = 0; i < BOARDWIDTH * BOARDHEIGHT; i++) { 
			var verticalPaths = directionalRubric(i, BOARDWIDTH), 
				horizontalPaths = directionalRubric(i, 1),
				diagonalUpPaths = directionalRubric(i, BOARDWIDTH+1),
				diagonalDownPaths = directionalRubric(i, BOARDWIDTH-1);

			RUBRIC[i] = $.merge( $.merge( $.merge( verticalPaths, horizontalPaths ), diagonalUpPaths ), diagonalDownPaths);
		}
	}

	var directionalRubric = function (cellNum, offset) {
		var dr = [],
			cell,
			edgeCount,
			path,
			maxDistance = WINNINGPATHSIZE-1,
			minPoint = cellNum - (maxDistance * offset);

		for (var start = minPoint; start <= cellNum; start += offset) {
			path = [];
			edgeCount = 0;
			for (var i = 0; i < WINNINGPATHSIZE; i += 1) {
				cell = start + (i * offset);
				if (isEdge(cell)) {
					edgeCount += 1;
				}

				if (isInBounds(cell)) {
					path.push(cell);
				} else {
					break;
				}
			}

			if (path.length === WINNINGPATHSIZE && (edgeCount < 2 || edgeCount == WINNINGPATHSIZE)) {
				//check the edge count to account for left-to-right or right-to-left crossover 
				dr.push(path);
			}
		}
		return dr;
	}

	var isEdge = function (cell) {
		//returns true if the cell is on the leftmost or rightmost column
		return cell%BOARDWIDTH === 0 || cell%BOARDWIDTH === BOARDWIDTH-1;
	}

	var isInBounds = function (cell) {
		return cell >= 0 && cell < BOARDWIDTH*BOARDHEIGHT;
	}

	var hasWinningPath = function (cellNum, cellList) {
		//compare the player's scorecard to the rubric for the cell that was just claimed. 
		//if the scorecard contains any of those winning paths, the player has won
		$.each( RUBRIC[cellNum], function( index, path ) {
		 	$.each( path, function( i, cell ) {
	     	if($.inArray(cell, cellList) == -1) return false;
		    
		    if (i == path.length-1) {
		    	//the player has all the cells in this winning path
					gameOver = true;
					$.map( path, function( val) {
					  $('[data-cell=' + val + ']').addClass('winning');
					});
				}
	     	return true;
	  	});
		});
		return gameOver;
	}

	var setMessage = function (message, color) {
		$('.notification').text(message).css('color', color ? color : '');
	}

	var initialize = function () {
		var $newRow = $('<div class="row">'),
			$newCell;
		gameOver = false;
		player = BLACK;
		SCORECARDS[BLACK] = [];
		SCORECARDS[RED] = [];
		setMessage("Your turn, Player 0");
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

    		if (!gameOver && columnHeight[colNum] == rowNum) {
    			$('.instructions').text('');
    			node.addClass(player ? 'red' : 'black').removeClass('selectable');
    			SCORECARDS[player].push(cellNum);
    			columnHeight[colNum] += 1;

    			if (SCORECARDS[player].length > 3 && hasWinningPath(cellNum, SCORECARDS[player])) {
  					setMessage("Player " + player + " has won!!!!", player ? 'red' : 'black');
  					$('.selectable').removeClass('selectable');
    			} else {
    				$('[data-cell=' + (cellNum + BOARDWIDTH) + ']').addClass('selectable');
	    			player = 1 - player;
	    			setMessage("Your turn, Player " + player, player ? 'red' : 'black');
    			}
    		} else if (columnHeight[colNum] !== rowNum) {
    			$('.instructions').text("Please select a valid cell");
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
	initialize();
})(jQuery)



