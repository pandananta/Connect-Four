
(function($){
  var RUBRIC = [], 
    WINNINGPATHSIZE = 4,
    BOARDWIDTH = 7,
    BOARDHEIGHT = 6,
    BLACK = 0, 
    RED = 1,
    PLAYMODE = 0,
    VIEWONlYMODE = 1;

  var scorecards = {},
    columnHeight,
    eligibleMoves,
    currentPlayer,
    gameOver,
    winningPath,
    gameMode = PLAYMODE, 
    gamePlayLoop;

  var generateRubric = function () {
    //for every cell, find all winning paths in every direction
    for (var i = 0; i < BOARDWIDTH * BOARDHEIGHT; i++) { 
      var verticalPaths = generateDirectionalRubric(i, BOARDWIDTH), 
        horizontalPaths = generateDirectionalRubric(i, 1),
        diagonalUpPaths = generateDirectionalRubric(i, BOARDWIDTH+1),
        diagonalDownPaths = generateDirectionalRubric(i, BOARDWIDTH-1);

      RUBRIC[i] = $.merge( $.merge( $.merge( verticalPaths, horizontalPaths ), diagonalUpPaths ), diagonalDownPaths);
    }
  }

  var generateDirectionalRubric = function (cellNum, offset) {
    var directionalRubric = [],
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
          //keep track of edges to account for paths that go out of bounds on the left or right
          edgeCount += 1;
        }

        if (isInBounds(cell)) {
          path.push(cell);
        } else {
          break;
        }
      }

      if (path.length === WINNINGPATHSIZE && (edgeCount < 2 || edgeCount === WINNINGPATHSIZE)) {
        //a valid path can either have no edge cells, one edge cell, or all edge cells
        directionalRubric.push(path);
      }
    }
    return directionalRubric;
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
    //if the player's scorecard contains any of those winning paths, the player has won
    $.each( RUBRIC[cellNum], function( index, path ) {
      $.each( path, function( i, cell ) {
        if ($.inArray(cell, cellList) === -1) { return false; }
        
        if (i === path.length-1) {
          //hooray! the player has all the cells in this winning path
          gameOver = true;
          winningPath = path;
          return false;
        }
      });
    });
    return gameOver;
  }

  var setMessage = function (message, color) {
    $('.notification').text(message).css('color', color ? color : '');
  }

  var move = function(node) {
    var cellNum = node.data("cell"), 
      rowNum = Math.floor(cellNum/BOARDWIDTH),
      colNum = cellNum%BOARDWIDTH;

    if (!gameOver && columnHeight[colNum] === rowNum) {
      $('.instructions').text('');
      node.addClass(currentPlayer ? 'red' : 'black').removeClass('selectable');
      scorecards[currentPlayer].push(cellNum);
      columnHeight[colNum] += 1;
      eligibleMoves = eligibleMoves.filter(function(elem){return elem != cellNum;});
      if (isInBounds(cellNum + BOARDWIDTH)) {
        eligibleMoves.push(cellNum + BOARDWIDTH);
      }

      if (scorecards[currentPlayer].length > 3 && hasWinningPath(cellNum, scorecards[currentPlayer])) {
        $.map(winningPath, function(val) {
          $(('[data-cell=' + val + ']')).addClass('winning');
        });
        setMessage("Player " + currentPlayer + " has won!!!!", currentPlayer ? 'red' : 'black');
        $('.selectable').removeClass('selectable');
      } else if (scorecards[BLACK].length + scorecards[RED].length === BOARDWIDTH*BOARDHEIGHT) {
        setMessage("Cat's Game :(");
        gameOver = true;
      }else {
        $('[data-cell=' + (cellNum + BOARDWIDTH) + ']').addClass('selectable');
        currentPlayer = 1 - currentPlayer;
        setMessage("Your turn, Player " + currentPlayer, currentPlayer ? 'red' : 'black');
      }
    } else if (columnHeight[colNum] !== rowNum) {
      $('.instructions').text("Please select a valid cell");
    }
  }

  var makeRandomMove = function () {
    if (gameOver || gameMode === PLAYMODE) {
      clearInterval(gamePlayLoop);
      gamePlayLoop = null;
      gameMode === VIEWONlYMODE ? setTimeout(initializeViewOnlyMode, 2000) : '';
    } else {
      var cellNum = eligibleMoves[Math.floor(Math.random()*eligibleMoves.length)],
        $node = $(('[data-cell=' + cellNum + ']'));
      move($node);
    }
  }

  var initializeBoard = function () {
    var $newRow = $('<div class="row">'),
      $newCell;
    $('.board').empty();
    for (var i = 0; i < BOARDWIDTH * BOARDHEIGHT; i++) { 
      $newCell = $('<div class="cell">').attr('data-cell', i);
      if (i < BOARDWIDTH) {
        $newCell.addClass('selectable');
        columnHeight[i] = 0;
        eligibleMoves.push(i);
      }
      $newCell.on('click', function(e) {
        move($(e.target));
      });
      $newRow.append($newCell);
      if (i%BOARDWIDTH === BOARDWIDTH-1)  {
        $('.board').prepend($newRow);
        $newRow = $('<div class="row">');
      }
    }
  }

  var initialize = function () {
    gameOver = false;
    currentPlayer = BLACK;
    scorecards[BLACK] = [];
    scorecards[RED] = [];
    winningPath = [];
    eligibleMoves = [];
    columnHeight = [];
    setMessage("Your turn, Player " + currentPlayer);
    initializeBoard();
  };

  var initializePlayMode= function () {
    initialize();
    gameMode = PLAYMODE;
  }

  var initializeViewOnlyMode = function () {
    initialize();
    gameMode = VIEWONlYMODE;
    gamePlayLoop = setInterval(makeRandomMove, 600);
  }

  $('.restart').on('click', initializePlayMode);
  $('.restartComputer').on('click', initializeViewOnlyMode);

  generateRubric();
  initialize();
})(jQuery)
