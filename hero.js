/*

  Strategies for the hero are contained within the "moves" object as
  name-value pairs, like so:

    //...
    ambusher : function(gamedData, helpers){
      // implementation of strategy.
    },
    heWhoLivesToFightAnotherDay: function(gamedData, helpers){
      // implementation of strategy.
    },
    //...other strategy definitions.

  The "moves" object only contains the data, but in order for a specific
  strategy to be implemented we MUST set the "move" variable to a
  definite property.  This is done like so:

  move = moves.heWhoLivesToFightAnotherDay;

  You MUST also export the move function, in order for your code to run
  So, at the bottom of this code, keep the line that says:

  module.exports = move;

  The "move" function must return "North", "South", "East", "West", or "Stay"
  (Anything else will be interpreted by the game as "Stay")

  The "move" function should accept two arguments that the website will be passing in:
    - a "gameData" object which holds all information about the current state
      of the battle

    - a "helpers" object, which contains useful helper functions
      - check out the helpers.js file to see what is available to you

    (the details of these objects can be found on javascriptbattle.com/#rules)

  Such is the power of Javascript!!!

*/

// Strategy definitions
var moves = {
  // Aggressor
  aggressor: function(gameData, helpers) {
    // Here, we ask if your hero's health is below 30
    if (gameData.activeHero.health <= 30){
      // If it is, head towards the nearest health well
      return helpers.findNearestHealthWell(gameData);
    } else {
      // Otherwise, go attack someone...anyone.
      return helpers.findNearestEnemy(gameData);
    }
  },

  // Health Nut
  healthNut:  function(gameData, helpers) {
    // Here, we ask if your hero's health is below 75
    if (gameData.activeHero.health <= 75){
      // If it is, head towards the nearest health well
      return helpers.findNearestHealthWell(gameData);
    } else {
      // Otherwise, go mine some diamonds!!!
      return helpers.findNearestNonTeamDiamondMine(gameData);
    }
  },

  // Balanced
  balanced: function(gameData, helpers){
    //FIXME : fix;
    return null;
  },

  // The "Northerner"
  // This hero will walk North.  Always.
  northener : function(gameData, helpers) {
    var myHero = gameData.activeHero;
    return 'North';
  },

  // The "Blind Man"
  // This hero will walk in a random direction each turn.
  blindMan : function(gameData, helpers) {
    var myHero = gameData.activeHero;
    var choices = ['North', 'South', 'East', 'West'];
    return choices[Math.floor(Math.random()*4)];
  },

  // The "Priest"
  // This hero will heal nearby friendly champions.
  priest : function(gameData, helpers) {
    var myHero = gameData.activeHero;
    if (myHero.health < 60) {
      return helpers.findNearestHealthWell(gameData);
    } else {
      return helpers.findNearestTeamMember(gameData);
    }
  },

  // The "Unwise Assassin"
  // This hero will attempt to kill the closest enemy hero. No matter what.
  unwiseAssassin : function(gameData, helpers) {
    var myHero = gameData.activeHero;
    if (myHero.health < 30) {
      return helpers.findNearestHealthWell(gameData);
    } else {
      return helpers.findNearestEnemy(gameData);
    }
  },

  // The "Careful Assassin"
  // This hero will attempt to kill the closest weaker enemy hero.
  carefulAssassin : function(gameData, helpers) {
    var myHero = gameData.activeHero;
    if (myHero.health < 50) {
      return helpers.findNearestHealthWell(gameData);
    } else {
      return helpers.findNearestWeakerEnemy(gameData);
    }
  },

  // The "Safe Diamond Miner"
  // This hero will attempt to capture enemy diamond mines.
  safeDiamondMiner : function(gameData, helpers) {
    var myHero = gameData.activeHero;

    //Get stats on the nearest health well
    var healthWellStats = helpers.findNearestObjectDirectionAndDistance(gameData.board, myHero, function(boardTile) {
      if (boardTile.type === 'HealthWell') {
        return true;
      }
    });
    var distanceToHealthWell = healthWellStats.distance;
    var directionToHealthWell = healthWellStats.direction;

    if (myHero.health < 40) {
      //Heal no matter what if low health
      return directionToHealthWell;
    } else if (myHero.health < 100 && distanceToHealthWell === 1) {
      //Heal if you aren't full health and are close to a health well already
      return directionToHealthWell;
    } else {
      //If healthy, go capture a diamond mine!
      return helpers.findNearestNonTeamDiamondMine(gameData);
    }
  },

  // The "Selfish Diamond Miner"
  // This hero will attempt to capture diamond mines (even those owned by teammates).
  selfishDiamondMiner :function(gameData, helpers) {
    var myHero = gameData.activeHero;

    //Get stats on the nearest health well
    var healthWellStats = helpers.findNearestObjectDirectionAndDistance(gameData.board, myHero, function(boardTile) {
      if (boardTile.type === 'HealthWell') {
        return true;
      }
    });

    var distanceToHealthWell = healthWellStats.distance;
    var directionToHealthWell = healthWellStats.direction;

    if (myHero.health < 40) {
      //Heal no matter what if low health
      return directionToHealthWell;
    } else if (myHero.health < 100 && distanceToHealthWell === 1) {
      //Heal if you aren't full health and are close to a health well already
      return directionToHealthWell;
    } else {
      //If healthy, go capture a diamond mine!
      return helpers.findNearestUnownedDiamondMine(gameData);
    }
  },

  // The "Coward"
  // This hero will try really hard not to die.
  coward : function(gameData, helpers) {
    return helpers.findNearestHealthWell(gameData);
  }
 };

//  Set our heros strategy
//var  move =  moves.aggressor;

/*
 * MY CODE
 *
 */

// helpful opportunist
var move = function(gameData, helpers) {
  var board = gameData.board;
  var me = gameData.activeHero;

  var lookAround = function(tile) {
    if(!tile.type) {
      return {}; // TODO: send in a PR to fix helpers.validCoordinates?
    }

    var aroundTile = {
      'North' : undefined,
      'East'  : undefined,
      'South' : undefined,
      'West'  : undefined
    };

    var direction;

    for(direction in aroundTile) {
      aroundTile[direction] = helpers.getTileNearby(
        board, tile.distanceFromTop, tile.distanceFromLeft, direction);
    }

    return aroundTile;
  };

  var isNearHealthWell = function(tile) {
    var aroundTile = lookAround(tile);
    var direction;

    for(direction in aroundTile) {
      if(aroundTile[direction].type === 'HealthWell') {
        return true;
      }
    }

    return false;
  };

  var findNearestWeakerEnemy = function() {
    //Get the path info object
    return helpers.findNearestObjectDirectionAndDistance(board, me, function(enemyTile) {
      if(enemyTile.type === 'Hero' && enemyTile.team !== me.team) {

        if(enemyTile.health <= 20) {
          return true; // see if you can beat them to health well
        }

        if(isNearHealthWell(enemyTile)) {
          return false; // they won't be weak for long
        }

        return enemyTile.health < me.health;
      }

      return false;
    });
  };

  var findBestDiamondMine = function() {
    var aroundMine;
    var direction;

    //Get the path info object
    return helpers.findNearestObjectDirectionAndDistance(board, me, function(mineTile) {
      if (mineTile.type === 'DiamondMine') {

        if(mineTile.owner && mineTile.owner.dead) {
          return true; // most players don't seem to know about this
        }

        aroundMine = lookAround(mineTile);
        for(direction in aroundMine) {
          if(aroundMine[direction].type === 'Hero' &&
            me.team === aroundMine[direction].team) {
            return false; // somebody is probably going to take it
          }
        }

        if(mineTile.owner) {
          return mineTile.owner.team !== me.team;
        }

        return true;
      }

      return false;
    }, board);
  };

  var findNearestHealthWell = function() {
    //Get the path info object
    return helpers.findNearestObjectDirectionAndDistance(board, me, function(healthWellTile) {
      return healthWellTile.type === 'HealthWell';
    });
  };

  var findNearestEnemy = function() {
    //Get the path info object
    return helpers.findNearestObjectDirectionAndDistance(board, me, function(enemyTile) {
      return enemyTile.type === 'Hero' && enemyTile.team !== me.team;
    });
  };

  //if(gameData.turn === 0 ) {
  //  gameData.healthWells.forEach(function(healthWell) { console.log(healthWell.distanceFromTop + 1, healthWell.distanceFromLeft); gameData.addHealthWell(healthWell.distanceFromTop + 1, healthWell.distanceFromLeft); } );
  //}

  var aroundMe = lookAround(me);
  var direction;
  var friend, enemy, mine, grave, well;
  var nearestHealthWell = findNearestHealthWell() || {};
  var nearestEnemy = findNearestEnemy() || {};
  var nearestWeakerEnemy, nearestNonTeamDiamondMine, nearestLongGoal;
  var defaultMoves = [
    'findNearestTeamMember',
    'findNearestEnemy'
  ];
  var defaultMove;
  var movePrecedence = {
    finishEnemy: 1,
    confrontEnemy: 2,
    helpFriend: 3,
    getHealthy: 4,
    takeBreak: 4,
    takeMine: 5,
    takeGrave: 6
  };
  var bestMove = {
    intent: undefined,
    direction: undefined
  };
  var determineBestMove = function(intent, direction) {
    if(direction !== undefined && bestMove.intent === undefined ||
        movePrecedence[bestMove.intent] > movePrecedence[intent]) {
      bestMove = {
        intent: intent,
        direction: direction
      }
    }
  };

  if(me.health <= 60) {
    // go get healthy
    determineBestMove('getHealthy', nearestHealthWell.direction);
  }

  for(direction in aroundMe) {
    switch(aroundMe[direction].type) {
      case 'Hero': {
        if(me.team === aroundMe[direction].team) {
          friend = aroundMe[direction];
        }
        else {
          enemy = aroundMe[direction];
        }

        if(friend && friend.health <= 60) {
          // help a weak friend
          determineBestMove('helpFriend', direction);
        }

        if(enemy && enemy.health <= 30) {
          // finish off a weak enemy
          determineBestMove('finishEnemy', direction);
        }

        // next to health well distance === 1
        if(enemy && !isNearHealthWell(enemy) &&
          nearestHealthWell.distance > 1 &&
          (nearestHealthWell.distance * 20) > me.health) {
          // fight for your life
          determineBestMove('confrontEnemy', direction);
        }

        break;
      }
      case 'DiamondMine': {
        mine = aroundMe[direction];

        if(mine.owner === undefined || mine.owner.dead ||
           mine.owner.team !== me.team) {
          determineBestMove('takeMine', direction);
        }

        break;
      }
      case 'HealthWell': {
        well = aroundMe[direction];

        // take in full health
        // if no enemies are around or the enemy isn't by a health well
        // otherwise 80% is the maximum you can have
        if((me.health < 100 &&
          (nearestEnemy.distance > 1 || !isNearHealthWell(nearestEnemy))) ||
          me.health < 80 ) {
          // chill out
          determineBestMove('takeBreak', direction);
        }

        break;
      }
      case 'Unoccupied': {
        if(aroundMe[direction].subType === 'Bones') {
          grave = aroundMe[direction];
          determineBestMove('takeGrave', direction);
        }
      }
    }
  }

  // long game
  if(!bestMove.direction) {
    nearestWeakerEnemy = findNearestWeakerEnemy();
    nearestNonTeamDiamondMine = findBestDiamondMine();

    if(nearestWeakerEnemy && nearestWeakerEnemy.distance) {
      nearestLongGoal = nearestWeakerEnemy;
      nearestLongGoal.intent = 'findNearestWeakerEnemy';
    }

    if(nearestNonTeamDiamondMine && nearestNonTeamDiamondMine.distance &&
      !nearestWeakerEnemy ||
      nearestNonTeamDiamondMine.distance < nearestWeakerEnemy.distance) {
      nearestLongGoal = nearestNonTeamDiamondMine;
      nearestLongGoal.intent = 'findBestDiamondMine';
    }

    if(nearestLongGoal) {
      determineBestMove(nearestLongGoal.intent, nearestLongGoal.direction);
    }
  }

  while(!bestMove.direction && defaultMoves.length) {
    defaultMove = defaultMoves.shift();
    determineBestMove(defaultMove, helpers[defaultMove].call(this, gameData));
  }

  //console.log(me, bestMove, aroundMe, friend, enemy, mine, well, grave);

  return bestMove.direction;
};


// Export the move function here
module.exports = move;
