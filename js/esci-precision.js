/*
Program       esci-precision.js
Author        Gordon Moore
Date          20 August 2020
Description   The JavaScript code for esci-precision
Licence       GNU General Public LIcence Version 3, 29 June 2007
*/

// #region Version history
/*
0.0.1   Initial version


*/
//#endregion 

let version = '0.0.1';

'use strict';
$(function() {
  console.log('jQuery here!');  //just to make sure everything is working

  //#region for variable definitions (just allows code folding)
  let tooltipson              = false;                                        //toggle the tooltips on or off

  let tab                     = 'Unpaired';                                     //what tab?

  const display            = document.querySelector('#display');        //display of pdf area

  let realHeight              = 100;                                          //the real world height for the pdf display area
  let margin                  = {top: 0, right: 10, bottom: 0, left: 70};     //margins for pdf display area
  let width;                                                                  //the true width of the pdf display area in pixels
  let heightP;   
  let rwidth;                                                                 //the width returned by resize
  let rheight;                                                                //the height returned by resize

  let svgD;                                                                   //the svg reference to pdfdisplay
 
  let $targetmoeslider                 = $('#targetmoeslider');
  const $targetmoenudgebackward        = $('#targetmoenudgebackward');
  const $targetmoenudgeforward         = $('#targetmoenudgeforward');

  let targetmoe = 0;
  let sliderinuse = false;

  let targetmoeslidertop;
  let targetmoesliderleft;
  let targetmoesliderwidth;

  let pauseId;
  let repeatId;
  let delay = 50;
  let pause = 500;


  //tab 1 panel 1
  const $ciud = $('#ciud');


  //tab 1 panel 2

  const $ncurveudavg = $('#ncurveudavg');
  let ncurveudavg = true;

  const $ncurveudass = $('#ncurveudass');
  let ncurveudass = false;

  //tab 1 panel 3
  const $displayvaluesud = $('#displayvaluesud');
  displayvaluesud = false;

  //tab 1 panel 4
  let $truncatedisplayudslider = $('#truncatedisplayudslider');
  let truncatedisplayud = 0.1;
  $truncatedisplayudval = $('#truncatedisplayudval');
  $truncatedisplayudval.val(0.1.toFixed(2));
  $truncatedisplayudnudgebackward = $('#truncatedisplayudnudgebackward');
  $truncatedisplayudnudgeforward = $('#truncatedisplayudnudgeforward');


  //tab 2 panel 1
  const $cipd = $('#cipd');
  let $correlationrhoslider = $('#correlationrhoslider');
  let correlationrho = -0.9;
  $correlationrhoval = $('#correlationrhoval');
  $correlationrhoval.val(correlationrho.toFixed(2));
  $correlationrhonudgebackward = $('#correlationrhonudgebackward');
  $correlationrhonudgeforward  = $('#correlationrhonudgeforward');

  //tab 2 panel 2

  const $ncurvepdavg = $('#ncurvepdavg');
  let ncurvepdavg = true;

  const $ncurvepdass = $('#ncurvepdass');
  let ncurvepdass = false;

  //tab 2 panel 3

  const $displayvaluespd = $('#displayvaluespd');
  displayvaluespd = false;

  //tab 2 panel 4
  let $truncatedisplaypdslider = $('#truncatedisplaypdslider');
  let truncatedisplaypd = 0.1;
  $truncatedisplaypdval = $('#truncatedisplaypdval');
  $truncatedisplaypdval.val(0.1.toFixed(2));
  $truncatedisplaypdnudgebackward = $('#truncatedisplaypdnudgebackward');
  $truncatedisplaypdnudgeforward = $('#truncatedisplaypdnudgeforward');



  //api for getting width, height of element - only gets element, not entire DOM
  // https://www.digitalocean.com/community/tutorials/js-resize-observer
  const resizeObserver = new ResizeObserver(entries => {
    entries.forEach(entry => {
      rwidth = entry.contentRect.width;
      //rHeight = entry.contentRect.height;  //doesn't work
      rheight = $('#display').outerHeight(true);
    });
  });

  //#endregion

  //breadcrumbs
  $('#homecrumb').on('click', function() {
    window.location.href = "https://www.esci.thenewstatistics.com/";
  })

  initialise();

  function initialise() {
    
    //tabs
    $('#smarttab').smartTab({
      selected: 0, // Initial selected tab, 0 = first tab
      theme: 'round', // theme for the tab, related css need to include for other than default theme
      orientation: 'horizontal', // Nav menu orientation. horizontal/vertical
      justified: true, // Nav menu justification. true/false
      autoAdjustHeight: true, // Automatically adjust content height
      backButtonSupport: true, // Enable the back button support
      enableURLhash: true, // Enable selection of the tab based on url hash
      transition: {
          animation: 'slide-horizontal', // Effect on navigation, none/fade/slide-horizontal/slide-vertical/slide-swing
          speed: '400', // Transion animation speed
          easing:'' // Transition animation easing. Not supported without a jQuery easing plugin
      },
      autoProgress: { // Auto navigate tabs on interval
          enabled: false, // Enable/Disable Auto navigation
          interval: 3500, // Auto navigate Interval (used only if "autoProgress" is set to true)
          stopOnFocus: true, // Stop auto navigation on focus and resume on outfocus
      },
      keyboardSettings: {
          keyNavigation: true, // Enable/Disable keyboard navigation(left and right keys are used if enabled)
          keyLeft: [37], // Left key code
          keyRight: [39] // Right key code
      }
    });

    //goto Unpaired tab
    $('#smarttab').smartTab("goToTab", 0);
    $('#smarttab').smartTab("goToTab", 1);
    $('#smarttab').smartTab("goToTab", 0);
    
    setTooltips();

    //get initial values for height/width
    rwidth  = $('#display').outerWidth(true);
    rheight = $('#display').outerHeight(true);

    //do this once?
    //set a reference to the displaypdf area
    d3.selectAll('svg > *').remove();  //remove all elements under svgP
    $('svg').remove();                 //remove the all svg elements from the DOM

    //pdf display
    svgD = d3.select('#display').append('svg').attr('width', '100%').attr('height', '100%');

    $ciud.text(0.1);
    $cipd.text(0.1);

    resize();

  }

  //Switch tabs
  $("#smarttab").on("showTab", function(e, anchorObject, tabIndex) {
    if (tabIndex === 0) {
      tab = 'Unpaired';

    }
    if (tabIndex === 1) {
      tab = 'Paired';

    }
  });

  function resize() {
    //have to watch out as the width and height do not always seem precise to pixels
    //browsers apparently do not expose true element width, height.
    //also have to think about box model. outerwidth(true) gets full width, not sure resizeObserver does.
    resizeObserver.observe(display);  //note doesn't get true outer width, height

    width   = rwidth - margin.left - margin.right;  
    heightP = rheight - margin.top - margin.bottom;

    if (tab === 'Unpaired') {}
    if (tab === 'Paired') {}

    //reposition target moe slider on resize
    targetmoetop = 0;
    //targetmoeleft = 0.1 * width + margin.left - 0;
    targetmoeleft = margin.left;
    targetmoewidth = width - 200;

    //position the d slider title
    $('#targetmoetitle').css({
      position:'absolute',
      top: targetmoetop,
      left: 10
    })
    
    //position the target slider
    $('#targetmoesliderdiv').css({
      position:'absolute',
      top: targetmoetop,
      left: targetmoeleft+80,
      width: targetmoewidth
    });

    //position the nudege bars
    $targetmoenudgebackward.css({
      position:'absolute',
      top: targetmoetop,
      left: targetmoeleft+targetmoewidth+100,
    })
    $targetmoenudgeforward.css({
      position:'absolute',
      top: targetmoetop,
      left: targetmoeleft+targetmoewidth+130,
    })    

    //clear();
    
  }

  //change tabs
  $("#smarttab").on("showTab", function(e, anchorObject, tabIndex) {
    if (tabIndex === 0) tab = 'Unpaired';
    if (tabIndex === 1) tab = 'Paired';

    setupSliders();

    clear();
  });

  function setupSliders() {
    $('#targetmoeslider').ionRangeSlider({
      skin: 'big',
      grid: true,
      grid_num: 5,
      type: 'single',
      min: 0.1,
      max: 1.5,
      from: 0.1,
      step: 0.1,
      prettify: prettify2,
      //on slider handles change
      onChange: function (data) {
        targetmoe = data.from;
        //xbarexperimental = xbarcontrol + cohensd * sdexperimental;
        sliderinuse = true;  //don't update dslider in redrawdisplay()
        redrawDisplay();
      }
    })
    $targetmoeslider = $('#targetmoeslider').data("ionRangeSlider");

    $('#truncatedisplayudslider').ionRangeSlider({
      skin: 'big',
      grid: true,
      grid_num: 4,
      type: 'single',
      min: 0.1,
      max: 0.3,
      from: 0.1,
      step: 0.05,
      prettify: prettify2,
      //on slider handles change
      onChange: function (data) {
        truncatedisplayud = data.from;
        sliderinuse = true;  //don't update slider
        redrawDisplay();
      }
    })
    $truncatedisplayudslider = $('#truncatedisplayudslider').data("ionRangeSlider");

    $('#correlationrhoslider').ionRangeSlider({
      skin: 'big',
      grid: true,
      grid_num: 4,
      type: 'single',
      min: -1.0,
      max: 1.0,
      from: -0.9,
      step: 0.01,
      prettify: prettify2,
      //on slider handles change
      onChange: function (data) {
        correlationrho = data.from;
        sliderinuse = true;  //don't update slider
        redrawDisplay();
      }
    })
    $correlationrhoslider = $('#correlationrhoslider').data("ionRangeSlider");

    $('#truncatedisplaypdslider').ionRangeSlider({
      skin: 'big',
      grid: true,
      grid_num: 4,
      type: 'single',
      min: 0.1,
      max: 0.3,
      from: 0.1,
      step: 0.05,
      prettify: prettify2,
      //on slider handles change
      onChange: function (data) {
        truncatedisplaypd = data.from;
        sliderinuse = true;  //don't update slider
        redrawDisplay();
      }
    })
    $truncatedisplaypdslider = $('#truncatedisplaypdslider').data("ionRangeSlider");


  }

  function prettify0(n) {
    return n.toFixed(0);
  }

  function prettify1(n) {
    return n.toFixed(1);
  }

  function prettify2(n) {
    return n.toFixed(2);
  }

  function updatetargetmoeslider() {
    $targetmoeslider.update({from: targetmoe});
  }

  //set everything to a default state.
  function clear() {
    //setsliders back to minimum
    targetmoe = 0.1;
    updatetargetmoeslider();
    $ciud.text(targetmoe);
    $cipd.text(targetmoe);

  }


  function redrawDisplay() {

    if (!sliderinuse) updatetargetmoeslider();
    sliderinuse = false;
    $ciud.text(targetmoe);
    $cipd.text(targetmoe);

    $truncatedisplayudval.val(truncatedisplayud.toFixed(2));    
    $truncatedisplaypdval.val(truncatedisplaypd.toFixed(2));
    $correlationrhoval.val(correlationrho.toFixed(2));
  }

  /*---------------------------------------------Tab 1 Panel 2 N Curves radio button-------------------*/

  $ncurveudavg.on('change', function() {
    ncurveudavg = true;
    ncurveudass = false;
  })

  $ncurveudass.on('change', function() {
    ncurveudavg = false;
    ncurveudass = true;
  })

  /*---------------------------------------------Tab 1 Panel 3 Display Values checkbox-------------------*/

  $displayvaluesud.on('change', function() {
    displayvaluesud = $displayvaluesud.is(':checked');

  })

  /*---------------------------------------------Tab 2 Panel 2 N Curves radio button-------------------*/

  $ncurvepdavg.on('change', function() {
    ncurveudavg = true;
    ncurveudass = false;
  })

  $ncurvepdass.on('change', function() {
    ncurvepdavg = false;
    ncurvepdass = true;
  })

  /*---------------------------------------------Tab 2 Panel 3 Display Values checkbox-------------------*/

  $displayvaluespd.on('change', function() {
    displayvaluespd = $displayvaluespd.is(':checked');

  })






   /*---------------------------------------------Target MoE nudge bars ----------------------------------------------*/

  //Target MoE nudge backwards
  $targetmoenudgebackward.on('mousedown', function() {
    targetmoenudgebackward();
    pauseId = setTimeout(function() {
      repeatId = setInterval ( function() {
        targetmoenudgebackward();
      }, delay );
    }, pause)  
  })

  $targetmoenudgebackward.on('mouseup', function() {
    clearInterval(repeatId);
    clearTimeout(pauseId);
  })

  function targetmoenudgebackward() {
    targetmoe -= 0.1;
    if (targetmoe < 0.1) targetmoe = 0.1;
    sliderinuse = true;
    updatetargetmoeslider()
    redrawDisplay();
  }
  
  //Target MoE nudge forwards
  $targetmoenudgeforward.on('mousedown', function() {
    targetmoenudgeforward();
    pauseId = setTimeout(function() {
      repeatId = setInterval ( function() {
        targetmoenudgeforward();
      }, delay );
    }, pause)
  })

  $targetmoenudgeforward.on('mouseup', function() {
    clearInterval(repeatId);
    clearTimeout(pauseId);
  })

  function targetmoenudgeforward() {
    targetmoe += 0.1;
    if (targetmoe > 1.5) targetmoe = 1.5;
    sliderinuse = true;
    updatetargetmoeslider()
    redrawDisplay();
  }

  /*----------------------------------------truncate display ud nudge bars-----------*/
  //changes to the trucated display unpaired data
  $truncatedisplayudval.on('change', function() {
    if ( isNaN($truncatedisplayudval.val()) ) {
      $truncatedisplayudval.val(truncatedisplayud.toFixed(2));
      return;
    };
    truncatedisplayud = parseFloat($truncatedisplayudval.val()).toFixed(2);
    if (truncatedisplayud < 0.1) {
      truncatedisplayud = 0.1;
    }
    if (truncatedisplayud > 0.3) {
      truncatedisplayud = 0.3;
    }
    $truncatedisplayudval.val(truncatedisplayud.toFixed(2));
    updatetruncatedisplayud();
  })

  $truncatedisplayudnudgebackward.on('mousedown', function() {
    truncatedisplayudnudgebackward();
    pauseId = setTimeout(function() {
      repeatId = setInterval ( function() {
        truncatedisplayudnudgebackward();
      }, delay );
    }, pause)
  })

  $truncatedisplayudnudgebackward.on('mouseup', function() {
    clearInterval(repeatId);
    clearTimeout(pauseId);
  })

  function truncatedisplayudnudgebackward() {
    truncatedisplayud -= 0.05;
    if (truncatedisplayud < 0.1) truncatedisplayud = 0.1;
    $truncatedisplayudval.val(truncatedisplayud.toFixed(2));
    updatetruncatedisplayud();
  }

  $truncatedisplayudnudgeforward.on('mousedown', function() {
    truncatedisplayudnudgeforward();
    pauseId = setTimeout(function() {
      repeatId = setInterval ( function() {
        truncatedisplayudnudgeforward();
      }, delay );
    }, pause)
  })

  $truncatedisplayudnudgeforward.on('mouseup', function() {
    clearInterval(repeatId);
    clearTimeout(pauseId);
  })

  function truncatedisplayudnudgeforward() {
    truncatedisplayud += 0.05;
    if (truncatedisplayud > 0.3) truncatedisplayud = 0.3;
    $truncatedisplayudval.val(truncatedisplayud.toFixed(2));
    updatetruncatedisplayud();
  }

  function updatetruncatedisplayud() {
    $truncatedisplayudslider.update({
      from: truncatedisplayud
    })
    redrawDisplay();
  }

  /*----------------------------------------truncate display pd nudge bars-----------*/
  //changes to the trucated display unpaired data
  $truncatedisplaypdval.on('change', function() {
    if ( isNaN($truncatedisplaypdval.val()) ) {
      $truncatedisplaypdval.val(truncatedisplaypd.toFixed(2));
      return;
    };
    truncatedisplaypd = parseFloat($truncatedisplaypdval.val()).toFixed(2);
    if (truncatedisplaypd < 0.1) {
      truncatedisplaypd = 0.1;
    }
    if (truncatedisplaypd > 0.3) {
      truncatedisplaypd = 0.3;
    }
    $truncatedisplaypdval.val(truncatedisplaypd.toFixed(2));
    updatetruncatedisplaypd();
  })

  $truncatedisplaypdnudgebackward.on('mousedown', function() {
    truncatedisplaypdnudgebackward();
    pauseId = setTimeout(function() {
      repeatId = setInterval ( function() {
        truncatedisplaypdnudgebackward();
      }, delay );
    }, pause)
  })

  $truncatedisplaypdnudgebackward.on('mouseup', function() {
    clearInterval(repeatId);
    clearTimeout(pauseId);
  })

  function truncatedisplaypdnudgebackward() {
    truncatedisplaypd -= 0.05;
    if (truncatedisplaypd < 0.1) truncatedisplaypd = 0.1;
    $truncatedisplaypdval.val(truncatedisplaypd.toFixed(1));
    updatetruncatedisplaypd();
  }

  $truncatedisplaypdnudgeforward.on('mousedown', function() {
    truncatedisplaypdnudgeforward();
    pauseId = setTimeout(function() {
      repeatId = setInterval ( function() {
        truncatedisplaypdnudgeforward();
      }, delay );
    }, pause)
  })

  $truncatedisplaypdnudgeforward.on('mouseup', function() {
    clearInterval(repeatId);
    clearTimeout(pauseId);
  })

  function truncatedisplaypdnudgeforward() {
    truncatedisplaypd += 0.05;
    if (truncatedisplaypd > 0.3) truncatedisplaypd = 0.3;
    $truncatedisplaypdval.val(truncatedisplaypd.toFixed(2));
    updatetruncatedisplaypd();
  }

  function updatetruncatedisplaypd() {
    $truncatedisplaypdslider.update({
      from: truncatedisplaypd
    })
    redrawDisplay();
  }


  /*----------------------------------------correlation rho nudge bars-----------*/
  //changes to the correlation rho unpaired data
  $correlationrhoval.on('change', function() {
    if ( isNaN($correlationrhoval.val()) ) {
      $correlationrhoval.val(correlationrhopd.toFixed(2));
      return;
    };
    correlationrho = parseFloat($correlationrhoval.val()).toFixed(2);
    if (correlationrho < -1) {
      correlationrho = -1.0;
    }
    if (correlationrho > 1) {
      correlationrho = 1.0;
    }
    $correlationrhoval.val(correlationrho.toFixed(2));
    updatecorrelationrho();
  })

  $correlationrhonudgebackward.on('mousedown', function() {
    correlationrhonudgebackward();
    pauseId = setTimeout(function() {
      repeatId = setInterval ( function() {
        correlationrhonudgebackward();
      }, delay );
    }, pause)
  })

  $correlationrhonudgebackward.on('mouseup', function() {
    clearInterval(repeatId);
    clearTimeout(pauseId);
  })

  function correlationrhonudgebackward() {
    correlationrho -= 0.01;
    if (correlationrho < -1.0 ) correlationrho = -1.0;
    $correlationrhoval.val(correlationrho.toFixed(2));
    updatecorrelationrho();
  }

  $correlationrhonudgeforward.on('mousedown', function() {
    correlationrhonudgeforward();
    pauseId = setTimeout(function() {
      repeatId = setInterval ( function() {
        correlationrhonudgeforward();
      }, delay );
    }, pause)
  })

  $correlationrhonudgeforward.on('mouseup', function() {
    clearInterval(repeatId);
    clearTimeout(pauseId);
  })

  function correlationrhonudgeforward() {
    correlationrho += 0.01;
    if (correlationrho > 1) correlationrho = 1;
    $correlationrhoval.val(correlationrho.toFixed(2));
    updatecorrelationrho();
  }

  function updatecorrelationrho() {
    $correlationrhoslider.update({
      from: correlationrho
    })
    redrawDisplay();
  }



  /*---------------------------------------------Tooltips on or off-------------------------------------- */

  function setTooltips() {
    Tipped.setDefaultSkin('esci');

    //heading section
    Tipped.create('#logo',          'Version: '+version,                              { skin: 'red', size: 'versionsize', behavior: 'mouse', target: 'mouse', maxWidth: 250, hideOthers: true, hideOnClickOutside: true, hideAfter: 0 });
  
    Tipped.create('#tooltipsonoff', 'Tips on/off, default is off!',                   { skin: 'esci', size: 'xlarge', showDelay: 750, behavior: 'mouse', target: 'mouse', maxWidth: 250, hideOthers: true, hideOnClickOutside: true, hideAfter: 0 });

    Tipped.create('.headingtip',    'https://thenewstatistics.com',                   { skin: 'esci', size: 'xlarge', showDelay: 750, behavior: 'mouse', target: 'mouse', maxWidth: 250, hideOthers: true, hideOnClickOutside: true, hideAfter: 0 });

    Tipped.create('.hometip',       'Click to return to esci Home',                   { skin: 'esci', size: 'xlarge', showDelay: 750, behavior: 'mouse', target: 'mouse', maxWidth: 250, hideOthers: true, hideOnClickOutside: true, hideAfter: 0 });

    //spare
    // Tipped.create('. tip', '', { skin: 'esci', size: 'xlarge', showDelay: 750, behavior: 'mouse', target: 'mouse', maxWidth: 250, hideOthers: true, hideOnClickOutside: true, hideAfter: 0 });

    Tipped.disable('[data-tooltip]');
  }

  $('#tooltipsonoff').on('click', function() {
    if (tooltipson) {
      tooltipson = false;
      $('#tooltipsonoff').css('background-color', 'lightgrey');
    }
    else {
      tooltipson = true;
      $('#tooltipsonoff').css('background-color', 'lightgreen');
      Tipped.enable('[data-tooltip]');
    }
  })


  /*----------------------------------------------------------footer----------------------------------------*/
 
  $('#footer').on('click', function() {
    window.location.href = "https://thenewstatistics.com/";
  })

  /*---------------------------------------------------------  resize event -----------------------------------------------*/
  $(window).bind('resize', function(e){
    window.resizeEvt;
    $(window).resize(function(){
        clearTimeout(window.resizeEvt);
        window.resizeEvt = setTimeout(function(){
          resize();
        }, 500);
    });
  });

  //helper function for testing
  function lg(s) {
    console.log(s);
  }  

})

