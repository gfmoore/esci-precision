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
0.0.2   21 Oct 2020 #2 Some development
0.0.3   21 Oct 2020 #2 More development and trying to figure out calcs!!! :(
0.0.4   22 Oct 2020 #2 More investigation into formulae, in development.
0.0.5   23 Oct 2020 #2 Mostly developed except for distribution. Closed.
0.0.6   23 Oct 2020 #3 First stab at moe distribution curve.

*/
//#endregion 

let version = '0.0.6';
let test = true;

'use strict';
$(function() {
  console.log('jQuery here!');  //just to make sure everything is working

  //#region for variable definitions (just allows code folding)
  let tooltipson              = false;                                        //toggle the tooltips on or off

  let tab                     = 'Unpaired';                                     //what tab?

  const display               = document.querySelector('#display');        //display of pdf area

  let maxN = 800;
  let margin                  = {top: 0, right: 30, bottom: 0, left: 70};     //margins for  display area
  let width;                                                                  //the true width of thedisplay area in pixels
  let heightD;   
  let rwidth;                                                                 //the width returned by resize
  let rheight;                                                                //the height returned by resize

  let x;
  let y;

  let alphaud = 0.05;  //significance level
  let alphapd = 0.05;
  let gamma = 0.99;    //assurance level of 0.01 but used with right tail for jStat.chisquared.inv 

  let fmoemax = 2.005;  
  let fmoeinc = 0.005;

  let svgD;                                                                   //the svg reference to pdfdisplay
 
  let Nlinez = [];
  let Nline = [];
  let NlineAss = [];

  let $targetmoeslider                 = $('#targetmoeslider');
  const $targetmoenudgebackward        = $('#targetmoenudgebackward');
  const $targetmoenudgeforward         = $('#targetmoenudgeforward');

  let targetmoe = 0.4;
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
  let truncatedisplayud = 0.25;
  $truncatedisplayudval = $('#truncatedisplayudval');
  $truncatedisplayudval.val(0.25.toFixed(2));
  $truncatedisplayudnudgebackward = $('#truncatedisplayudnudgebackward');
  $truncatedisplayudnudgeforward = $('#truncatedisplayudnudgeforward');

  //tab 1 panel 5 CI
  const $CIsectionud = $('#CIsectionud');
  const $CIud = $('#CIud');
 

  //tab 2 panel 1
  const $cipd = $('#cipd');

  //tab 2 panel 2
  let $correlationrhoslider = $('#correlationrhoslider');
  let correlationrho = 0.7;
  $correlationrhoval = $('#correlationrhoval');
  $correlationrhoval.val(correlationrho.toFixed(2));
  $correlationrhonudgebackward = $('#correlationrhonudgebackward');
  $correlationrhonudgeforward  = $('#correlationrhonudgeforward');

  //tab 2 panel 3
  const $ncurvepdavg = $('#ncurvepdavg');
  let ncurvepdavg = true;

  const $ncurvepdass = $('#ncurvepdass');
  let ncurvepdass = false;

  //tab 2 panel 4

  const $displayvaluespd = $('#displayvaluespd');
  displayvaluespd = false;

  //tab 2 panel 5
  let $truncatedisplaypdslider = $('#truncatedisplaypdslider');
  let truncatedisplaypd = 0.25;
  $truncatedisplaypdval = $('#truncatedisplaypdval');
  $truncatedisplaypdval.val(0.25.toFixed(2));
  $truncatedisplaypdnudgebackward = $('#truncatedisplaypdnudgebackward');
  $truncatedisplaypdnudgeforward = $('#truncatedisplaypdnudgeforward');

  //tab 2 panel 6 CI
  const $CIsectionpd = $('#CIsectionpd');
  const $CIpd = $('#CIpd');
   

  //#endregion

  //breadcrumbs
  $('#homecrumb').on('click', function() {
    window.location.href = "https://www.esci.thenewstatistics.com/";
  })

  initialise();

  function initialise() {
    if (test) {
      $displayvaluesud.prop('checked', true);
      displayvaluesud = true;

      $displayvaluespd.prop('checked', true);
      displayvaluespd = true;

      $CIsectionud.hide();
      $CIsectionpd.hide();
    }

    //tab switching
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
          //easing:'' // Transition animation easing. Not supported without a jQuery easing plugin
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
    //$('#smarttab').smartTab("goToTab", 0);

    setTooltips();

    //get initial values for height/width
    rwidth  = $('html').outerWidth(true)  - $('#leftpanel').outerWidth(true);
    rheight = $('#display').outerHeight(true);

    width   = rwidth - margin.left - margin.right;  
    heightD = rheight - margin.top - margin.bottom;

    //do this once?
    //set a reference to the displaypdf area
    d3.selectAll('svg > *').remove();  //remove all elements under svgD
    $('svg').remove();                 //remove the all svg elements from the DOM

    //d3 code for drawing lines
    line = d3.line() 
    .x(function(d, i) { return x(d.fmoe); })
    .y(function(d, i) { return y(d.N); });

    //pdf display
    svgD = d3.select('#display').append('svg').attr('width', '100%').attr('height', '100%');

    $ciud.text(0.25);
    $cipd.text(0.25);

    setupSliders();
    clear();

  }

  //set everything to a default state.
  function clear() {

    if (tab === 'Unpaired') {}
    if (tab === 'Paired') {}

    // #region position sliders
    //reposition target moe slider on resize
    targetmoetop = 0;
    targetmoeleft = margin.left;
    targetmoewidth = width - 50;

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
      left: targetmoeleft,
      width: targetmoewidth
    });

    //position the nudege bars
    $targetmoenudgebackward.css({
      position:'absolute',
      top: targetmoetop,
      left: targetmoeleft+targetmoewidth+10,
    })
    $targetmoenudgeforward.css({
      position:'absolute',
      top: targetmoetop,
      left: targetmoeleft+targetmoewidth+30,
    })    
    // #endregion

    drawNline();
    drawTargetMoELine();
    drawMoECurve();
  }
  

  //Switch tabs
  $("#smarttab").on("showTab", function(e, anchorObject, tabIndex) {
    if (tabIndex === 0) {
      tab = 'Unpaired';
      
    }
    if (tabIndex === 1) {
      tab = 'Paired';
    }

    clear();
  });

  function resize() {

    rwidth  = $('html').outerWidth(true)  - $('#leftpanel').outerWidth(true);
    rheight = $('#main').outerHeight(true);

    width   = rwidth - margin.left - margin.right;  
    heightD = rheight - margin.top - margin.bottom;

    clear();
  }

  function setupSliders() {
    $('#targetmoeslider').ionRangeSlider({
      skin: 'big',
      grid: true,
      grid_num: 5,
      type: 'single',
      min: 0.0,
      max: 2.0,
      from: 0.4,
      step: 0.005,
      prettify: prettify2,
      //on slider handles change
      onChange: function (data) {
        targetmoe = data.from;
        if (targetmoe < 0.05) {
          targetmoe = 0.05;
          $targetmoeslider.update({ from: targetmoe });
        }
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
      min: 0.05,
      max: 0.3,
      from: 0.25,
      step: 0.05,
      prettify: prettify2,
      //on slider handles change
      onChange: function (data) {
        truncatedisplayud = data.from;
        if (truncatedisplayud < 0.05) {
          truncatedisplayud = 0.05;
          $truncatedisplayudslider.update({ from: truncatedisplayud });
        }
        sliderinuse = true;  //don't update slider in redrawDisplay()
        targetmoe = truncatedisplayud;
        updatetargetmoeslider();
        redrawDisplay();
      }
    })
    $truncatedisplayudslider = $('#truncatedisplayudslider').data("ionRangeSlider");

    $('#correlationrhoslider').ionRangeSlider({
      skin: 'big',
      grid: true,
      grid_num: 4,
      type: 'single',
      min: 0,
      max: 1.0,
      from: 0.7,
      step: 0.005,
      prettify: prettify2,
      //on slider handles change
      onChange: function (data) {
        correlationrho = data.from;
        if (correlationrho >= 0.99) {
          correlationrho = 0.99;
          $correlationrhoslider.update({ from: correlationrho });
        }
        sliderinuse = true;  //don't update slider  in redrawDisplay()
        redrawDisplay();
      }
    })
    $correlationrhoslider = $('#correlationrhoslider').data("ionRangeSlider");

    $('#truncatedisplaypdslider').ionRangeSlider({
      skin: 'big',
      grid: true,
      grid_num: 4,
      type: 'single',
      min: 0.05,
      max: 0.3,
      from: 0.25,
      step: 0.05,
      prettify: prettify2,
      //on slider handles change
      onChange: function (data) {
        truncatedisplaypd = data.from;
        if (truncatedisplaypd < 0.05) {
          truncatedisplaypd = 0.05;
          $truncatedisplaypdslider.update({ from: truncatedisplaypd });
        }
        sliderinuse = true;  //don't update slider
        redrawDisplay();
      }
    })
    $truncatedisplaypdslider = $('#truncatedisplaypdslider').data("ionRangeSlider");


    function prettify0(n) {
      return n.toFixed(0);
    }
  
    function prettify1(n) {
      return n.toFixed(1);
    }
  
    function prettify2(n) {
      return n.toFixed(2);
    }
  

  }

  function updatetargetmoeslider() {
    if (targetmoe < 0.05) targetmoe = 0.05;
    if (targetmoe > 2.0) targetmoe = 2.0;
    $targetmoeslider.update({from: targetmoe});
    $ciud.text(targetmoe.toFixed(2));
    $cipd.text(targetmoe.toFixed(2));
  }

  function redrawDisplay() {

    if (!sliderinuse) updatetargetmoeslider();
    sliderinuse = false;
    $ciud.text(targetmoe.toFixed(2));
    $cipd.text(targetmoe.toFixed(2));

    $truncatedisplayudval.val(truncatedisplayud.toFixed(2));    
    $truncatedisplaypdval.val(truncatedisplaypd.toFixed(2));
    $correlationrhoval.val(correlationrho.toFixed(2));

    if (tab === 'Unpaired') {
      if (targetmoe < truncatedisplayud) {
        targetmoe = truncatedisplayud;
        updatetargetmoeslider();
      }
    }

    if (tab === 'Paired') {
      if (targetmoe < truncatedisplaypd) {
        targetmoe = truncatedisplaypd;
        updatetargetmoeslider();
      }
    }

    drawNline();
    drawTargetMoELine();
    drawMoECurve();
  }

  function setupAxes() {

    //get maximum values of data points array
    if (tab === 'Unpaired') {
      if (ncurveudass) {
        maxN = d3.max(NlineAss, function(d) { return +d.N;} );
      }
      else {
        maxN = d3.max(Nline, function(d) { return +d.N;} );
      }
    }
    if (tab === 'Paired') {
      if (ncurvepdass) {
        maxN = d3.max(NlineAss, function(d) { return +d.N;} );
      }
      else {
        maxN = d3.max(Nline, function(d) { return +d.N;} );
      }
    }
    if (maxN < 200) maxN = 10 * Math.ceil(maxN/10);
    if (maxN > 200 && maxN < 1000) maxN = 100 * Math.ceil(maxN/100); //now round up to nearest 100
    if (maxN >= 1000) maxN = 1000 * Math.ceil(maxN/1000); //now round up to nearest 100

    //clear axes
    d3.selectAll('.leftaxis').remove();
    d3.selectAll('.leftaxisminorticks').remove();
    d3.selectAll('.leftaxistext').remove();

    d3.selectAll('.bottomaxis').remove();
    d3.selectAll('.bottomaxisminorticks').remove();
    d3.selectAll('.bottomaxistext').remove();

    d3.selectAll('.headertext').remove();

    width   = rwidth - margin.left - margin.right;  
    heightD = $('#display').outerHeight(true) - margin.top - margin.bottom;

    x = d3.scaleLinear().domain([0, 2.0]).range([margin.left, width]);
    y = d3.scaleLinear().domain([0, maxN]).range([heightD-50, 60]);  

    //test co-ords
    // svgD.append('circle').attr('class', 'test').attr('cx', x(0)).attr('cy', y(0)).attr('r', 10).attr('stroke', 'red').attr('stroke-width', 2).attr('fill', 'red');  
    // svgD.append('circle').attr('class', 'test').attr('cx', x(0)).attr('cy', y(100)).attr('r', 10).attr('stroke', 'red').attr('stroke-width', 2).attr('fill', 'red');  
    // svgD.append('circle').attr('class', 'test').attr('cx', x(1.5)).attr('cy', y(0)).attr('r', 10).attr('stroke', 'red').attr('stroke-width', 2).attr('fill', 'red');  
    // svgD.append('circle').attr('class', 'test').attr('cx', x(1.5)).attr('cy', y(100)).attr('r', 10).attr('stroke', 'red').attr('stroke-width', 2).attr('fill', 'red');  


    //bottom horizontal axis
    let xAxis = d3.axisBottom(x);   //.tickSizeOuter(0);  //tickSizeOuter gets rid of the start and end ticks
    svgD.append('g').attr('class', 'bottomaxis').style("font", "1.8rem sans-serif").attr( 'transform', `translate(0, ${heightD-50})` ).call(xAxis);

    //left vertical axis
    let yAxis = d3.axisLeft(y);   //.tickSizeOuter(0);  //tickSizeOuter gets rid of the start and end ticks
    svgD.append('g').attr('class', 'leftaxis').style("font", "1.8rem sans-serif").attr( 'transform', `translate(${margin.left}, 0)` ).call(yAxis);

    //add some text labels
    svgD.append('text').text('N').attr('class', 'bottomaxistext').attr('x', 10 ).attr('y', heightD/2).attr('text-anchor', 'start').attr('fill', 'black').attr('font-size', '1.8rem').style('font-style', 'italic');
    svgD.append('text').text('MoE of 95% CI, in population standard deviation units').attr('class', 'leftaxistext').attr('x', width/4 ).attr('y', heightD-10).attr('text-anchor', 'start').attr('fill', 'black').attr('font-size', '1.4rem').style('font-style', 'italic');
    
    //add header labels
    if (tab === 'Unpaired') {
    svgD.append('text').text('Two groups:').attr('class', 'headertext').attr('x', 10 ).attr('y', 20).attr('text-anchor', 'start').attr('fill', 'black').attr('font-size', '1.8rem');
    svgD.append('text').text('N').attr('class', 'headertext').attr('x', 130 ).attr('y', 20).attr('text-anchor', 'start').attr('fill', 'black').attr('font-size', '1.8rem').style('font-style', 'italic');
    svgD.append('text').text('of each group, for desired precision').attr('class', 'headertext').attr('x', 150 ).attr('y', 20).attr('text-anchor', 'start').attr('fill', 'black').attr('font-size', '1.8rem');
    }
    else {
      svgD.append('text').text('Paired data:').attr('class', 'headertext').attr('x', 10 ).attr('y', 20).attr('text-anchor', 'start').attr('fill', 'black').attr('font-size', '1.8rem');
      svgD.append('text').text('N').attr('class', 'headertext').attr('x', 130 ).attr('y', 20).attr('text-anchor', 'start').attr('fill', 'black').attr('font-size', '1.8rem').style('font-style', 'italic');
      svgD.append('text').text('is the number of pairs, for desired precision').attr('class', 'headertext').attr('x', 150 ).attr('y', 20).attr('text-anchor', 'start').attr('fill', 'black').attr('font-size', '1.8rem');  
    }

    //add additional ticks for x scale
    //the minor ticks
    let interval = d3.ticks(0, 1.5, 16);  //gets an array of where it is putting tick marks

    let i;
    let minortick;
    let minortickmark;

    //half way ticks
    for (i = 1; i < interval.length; i += 1) {
      minortick = (interval[i] - interval[i-1]);
      for (let ticks = 1; ticks <= 16; ticks += 1) {
        minortickmark = interval[i-1] + (minortick * ticks);
        if (minortickmark > 0 && minortickmark < 1.5) svgD.append('line').attr('class', 'bottomaxis').attr('x1', x(minortickmark)).attr('y1', 0).attr('x2', x(minortickmark) ).attr('y2', 10).attr('stroke', 'black').attr('stroke-width', 1).attr( 'transform', `translate(0, ${heightD-50})` );
      }
    }

    //minor ticks
    // for (i=1; i < interval.length; i += 1) {
    //   minortick = (interval[i] - interval[i-1]) / 10;
    //   for (let ticks = 1; ticks <= 10; ticks += 1) {
    //     minortickmark = interval[i-1] + (minortick * ticks);
    //     if (minortickmark > -3 && minortickmark < 3) {
    //          svgS.append('line').attr('class', 'xaxis').attr('x1', x(minortickmark)).attr('y1', 0).attr('x2', x(minortickmark) ).attr('y2', 5).attr('stroke', 'black').attr('stroke-width', 1).attr( 'transform', `translate(0, ${heightD})` );
    //          svgS.append('line').attr('class', 'yaxis').attr('x1', 0).attr('y1', y(minortickmark)).attr('x2', 5 ).attr('y2', y(minortickmark)).attr('stroke', 'black').attr('stroke-width', 1).attr( 'transform', `translate(0, ${heightD})` );
    //      }
    //   }
    // }

  }

  function drawNline() {
    //get the current values

    let cv; //critical value
    //Nlinez = [];
    Nline = [];
    NlineAss = [];
    let N;
    //let oldN;
    //maxN = 0;    //get maximum y (N) value

    d3.selectAll('.Nline').remove();
    d3.selectAll('.NlineAss').remove();

    d3.selectAll('.Nlinetext').remove();
    d3.selectAll('.Nlinetextbox').remove();

    d3.selectAll('.NlinetextAss').remove();
    //d3.selectAll('.NlinetextAssbox').remove();

    alphaud = parseFloat($CIud.val());
    alphapd = parseFloat($CIpd.val());

    
    //create datasets Nline, NlineAss //get N,    note fmoe is the f that Prof. Cumming uses in book
    if (tab === 'Unpaired') {

      //average
      for (let fmoe = truncatedisplayud; fmoe < fmoemax; fmoe += fmoeinc) {
      
        cv = Math.abs(jStat.normal.inv( alphaud/2, 0, 1));  //1.96
        N = 2 * (cv/fmoe) * (cv/fmoe);
        if (N < 3) N = 3; //minimum N allowed is 3

        //now iterate on t 9 times
        for (let i = 0; i < 9; i += 1) {
          cv = Math.abs(jStat.studentt.inv( alphaud/2, 2*N - 2 ));
          N = 2 * (cv/fmoe) * (cv/fmoe);
          if (N < 3) N = 3;
        }

        Nline.push( { fmoe: parseFloat(fmoe.toFixed(3)), N: Math.ceil(N) } );   
      }

      //assurance
      let df;
      if (ncurveudass) {
        for (let fmoe = truncatedisplayud; fmoe < fmoemax; fmoe += fmoeinc) {
          cv = Math.abs(jStat.normal.inv( alphaud/2, 0, 1));  //1.96
          N = 2 * (cv/fmoe) * (cv/fmoe);
  
          //first iteration - nt1 in spreadsheet
          df = 2 *  Math.abs( jStat.chisquare.inv(gamma, N) ) ;
          cv = Math.abs(jStat.studentt.inv( alphaud/2, df )); 
          N = 2 * (cv/fmoe) * (cv/fmoe) * ( Math.abs(jStat.chisquare.inv(0.99, df)) ) / df;
          if (N < 3) N = 3;

          for (let i = 1; i < 9; i += 1) {
            df = 2 * N - 2;
            cv = Math.abs(jStat.studentt.inv( alphaud/2, df )); 
            N = 2 * (cv/fmoe) * (cv/fmoe) * ( Math.abs(jStat.chisquare.inv(gamma, df)) ) / df;
            if (N < 3) N = 3;
          }
  
          NlineAss.push( { fmoe: parseFloat(fmoe.toFixed(3)), N: Math.ceil(N) } )    
        }
      }
    }

    if (tab === 'Paired') {
      //average
      for (let fmoe = truncatedisplaypd; fmoe < fmoemax; fmoe += fmoeinc) {
        cv = Math.abs(jStat.normal.inv( alphapd/2, 0, 1));  //1.96
        N = 2 * (1 - correlationrho) * (cv/fmoe) * (cv/fmoe);
        if (N < 3) N = 3; //minimum N allowed is 3

        //now iterate on t 9 times   At times, when N gets to about 3 the N starts oscillating, pick the lowest
        minN = 999;
        for (let i = 0; i < 9; i += 1) {
          cv = Math.abs(jStat.studentt.inv( alphapd/2, N - 1 ));
          N =  2 * (1 - correlationrho) * (cv/fmoe) * (cv/fmoe);

          if (N < 3) N = 3;
          if (N < minN) minN = N;
        }

        Nline.push( { fmoe: parseFloat(fmoe.toFixed(3)), N: Math.ceil(minN) } );   
      }

      //assurance
      if (ncurvepdass) {
        minN = 999;   //have to put this here to stop oscillations
        for (let fmoe = truncatedisplaypd; fmoe < fmoemax; fmoe += fmoeinc) {
          cv = Math.abs(jStat.normal.inv( alphapd/2, 0, 1));  //1.96
          N = 2 * (1 - correlationrho) * (cv/fmoe) * (cv/fmoe);
          if (N < 3) N = 3; //minimum N allowed is 3
  
          //first iteration - nt1 in spreadsheet
          df = Math.abs( jStat.chisquare.inv(gamma, N) ) - 1;
          cv = Math.abs(jStat.studentt.inv( alphapd/2, df )); 
          N = 2 * (1 - correlationrho) * (cv/fmoe) * (cv/fmoe) * ( Math.abs(jStat.chisquare.inv(gamma, df)) ) / df;
          if (N < 3) N = 3;


          for (let i = 1; i < 9; i += 1) {
            df = N - 1;
            //df = Math.max( Math.min( Math.ceil(N) - 1, N + 1), N - 1);

            cv = Math.abs(jStat.studentt.inv( alphapd/2, df )); 
            N = 2 * (1 - correlationrho) * (cv/fmoe) * (cv/fmoe) * ( Math.abs(jStat.chisquare.inv(gamma, df)) ) / df;
            if (N < 4) N = 4;  //is this a fiddle?
            if (N < minN) minN = N;
          }
  
          NlineAss.push( { fmoe: parseFloat(fmoe.toFixed(3)), N: Math.ceil(minN) } )    
   
        }
      }
    }

    //now display the line(s)
    setupAxes();  //have to call this  as will need to redisplay vertical axis as maxN changes

    if (tab === 'Unpaired') {
      if (ncurveudavg) {  //if average
        //the z line
        //svgD.append('path').attr('class', 'Nline').attr('d', line(Nlinez)).attr('stroke', 'blue').attr('stroke-width', 2).attr('fill', 'none');
        svgD.append('path').attr('class', 'Nline').attr('d', line(Nline)).attr('stroke', 'black').attr('stroke-width', 2).attr('fill', 'none');
      }
      if (ncurveudass) {  //if assurance
        svgD.append('path').attr('class', 'Nline').attr('d', line(Nline)).attr('stroke', 'lightgray').attr('stroke-width', 2).attr('fill', 'none');
        svgD.append('path').attr('class', 'NlineAss').attr('d', line(NlineAss)).attr('stroke', 'red').attr('stroke-width', 2).attr('fill', 'none');
      }
    }

    if (tab === 'Paired') {
      if (ncurvepdavg) {  //if average
        svgD.append('path').attr('class', 'Nline').attr('d', line(Nline)).attr('stroke', 'black').attr('stroke-width', 2).attr('fill', 'none');
      }
      if (ncurvepdass) {  //if assurance
        svgD.append('path').attr('class', 'Nline').attr('d', line(Nline)).attr('stroke', 'lightgray').attr('stroke-width', 2).attr('fill', 'none');
        svgD.append('path').attr('class', 'NlineAss').attr('d', line(NlineAss)).attr('stroke', 'red').attr('stroke-width', 2).attr('fill', 'none');
      }
    }


    //Now decide whether to display N values
    if (tab === 'Unpaired' && displayvaluesud) {
      $.each(Nline, function(key, value) {
        //only plot blobs at 0.05 intervals
        if (parseInt(1000 * value.fmoe) % 50 === 0) {
          svgD.append('circle').attr('class', 'Nlinetext').attr('cx', x(value.fmoe)).attr('cy', y(value.N)).attr('r', 4).attr('stroke', 'black').attr('stroke-width', 1).attr('fill', 'black');  
          //don't draw if intersection with targetmoe as already drawn in bold
          if (Math.abs(targetmoe -value.fmoe) > 0.01) {
            //draw a blank box
            svgD.append('rect').attr('class', 'Nlinetextbox').attr('x', x(value.fmoe) - 10 ).attr('y', y(value.N) + 6 ).attr('width', 20 ).attr('height', 16 ).attr('stroke', 0).attr('fill', 'white');
            svgD.append('text').text(value.N).attr('class', 'Nlinetext').attr('x', x(value.fmoe) - 10 ).attr('y', y(value.N) + 20 ).attr('text-anchor', 'start').attr('fill', 'black');
          }
        }

      })

      //make grey
      if (ncurveudass) {
        d3.selectAll('.Nline').attr('stroke', 'lightgray');   
        d3.selectAll('.Nlinetext').attr('stroke', 'lightgray').attr('fill', 'lightgray');        
      }

      if (displayvaluesud) {
        $.each(NlineAss, function(key, value) {
          //only plot blobs at 0.05 intervals
          if (parseInt(1000 * value.fmoe) % 50 === 0) {
            svgD.append('circle').attr('class', 'NlinetextAss').attr('cx', x(value.fmoe)).attr('cy', y(value.N)).attr('r', 4).attr('stroke', 'red').attr('stroke-width', 1).attr('fill', 'red');  
            //don't draw if intersection with targetmoe as already drawn in bold
            if (Math.abs(targetmoe -value.fmoe) > 0.01) svgD.append('text').text(value.N).attr('class', 'NlinetextAss').attr('x', x(value.fmoe) + 5 ).attr('y', y(value.N) - 7 ).attr('text-anchor', 'start').attr('fill', 'red');
          }
        })
      }
    }

    if (tab === 'Paired' && displayvaluespd) {
      $.each(Nline, function(key, value) {
        //only plot blobs at 0.05 intervals
        if (parseInt(1000 * value.fmoe) % 50 === 0) {
          svgD.append('circle').attr('class', 'Nlinetext').attr('cx', x(value.fmoe)).attr('cy', y(value.N)).attr('r', 4).attr('stroke', 'black').attr('stroke-width', 1).attr('fill', 'black');  
          //don't draw if intersection with targetmoe as already drawn in bold
          if (Math.abs(targetmoe -value.fmoe) > 0.01) {
            //draw a blank box
            svgD.append('rect').attr('class', 'Nlinetextbox').attr('x', x(value.fmoe) - 10 ).attr('y', y(value.N) + 6 ).attr('width', 20 ).attr('height', 16 ).attr('stroke', 0).attr('fill', 'white');
            svgD.append('text').text(value.N).attr('class', 'Nlinetext').attr('x', x(value.fmoe) - 10 ).attr('y', y(value.N) + 20 ).attr('text-anchor', 'start').attr('fill', 'black');
          }
        }
      })

      //make grey
      if (ncurvepdass) {
        d3.selectAll('.Nline').attr('stroke', 'lightgray');   
        d3.selectAll('.Nlinetext').attr('stroke', 'lightgray').attr('fill', 'lightgray');        
      }      

      if (displayvaluespd) {
        $.each(NlineAss, function(key, value) {
          //only plot blobs at 0.05 intervals
          if (parseInt(1000 * value.fmoe) % 50 === 0) {
            svgD.append('circle').attr('class', 'NlinetextAss').attr('cx', x(value.fmoe)).attr('cy', y(value.N)).attr('r', 4).attr('stroke', 'red').attr('stroke-width', 1).attr('fill', 'red');  
            //don't draw if intersection with targetmoe as already drawn in bold
            if (Math.abs(targetmoe - value.fmoe) > 0.01) svgD.append('text').text(value.N).attr('class', 'NlinetextAss').attr('x', x(value.fmoe) + 5 ).attr('y', y(value.N) - 7 ).attr('text-anchor', 'start').attr('fill', 'red');
          }
        })
      }
    }

  }

  function drawTargetMoELine() {

    let n;

    d3.selectAll('.targetmoeline').remove();
    d3.selectAll('.targetmoelinetext').remove();
    d3.selectAll('.targetmoelineblob').remove();
    d3.selectAll('.targetmoelineblobtext').remove();

    //draw vertical line and label
    svgD.append('line').attr('class', 'targetmoeline').attr('x1', x(targetmoe)).attr('y1', y(0)).attr('x2', x(targetmoe)).attr('y2', y(maxN)).attr('stroke', 'firebrick').attr('stroke-width', 3).attr('fill', 'none');
    svgD.append('text').text('Target MoE').attr('class', 'targetmoelinetext').attr('x', x(targetmoe) - 40 ).attr('y', y(maxN)-20).attr('text-anchor', 'start').attr('fill', 'firebrick').attr('font-size', '1.8rem');

  
    //find the N for that fmoe value from the Nline data array of objects (probably a functional way, but hey this works)
    if (tab === 'Unpaired' && ncurveudavg) {
      for (let i = 0; i < Nline.length; i += 1) {
        if (Math.abs(targetmoe - Nline[i].fmoe) < 0.001) {
          n = Nline[i].N;
          break;
        }
      }
    }

    if (tab === 'Unpaired' && ncurveudass) {
      for (let i = 0; i < NlineAss.length; i += 1) {
        if (Math.abs(targetmoe - NlineAss[i].fmoe) < 0.001) {
          n = NlineAss[i].N;
          break;
        }
      }
    }

    if (tab === 'Paired' && ncurvepdavg) {
      for (let i = 0; i < Nline.length; i += 1) {
        if (Math.abs(targetmoe - Nline[i].fmoe) < 0.001) {
          n = Nline[i].N;
          break;
        }
      }
    }

    if (tab === 'Paired' && ncurvepdass) {
      for (let i = 0; i < NlineAss.length; i += 1) {
        if (Math.abs(targetmoe - NlineAss[i].fmoe) < 0.001) {
          n = NlineAss[i].N;
          break;
        }
      }
    }

    //Now add a blob and value at intersection    
    if (tab === 'Unpaired' && ncurveudavg) {
      svgD.append('circle').attr('class', 'targetmoelineblob').attr('cx', x(targetmoe)).attr('cy', y(n)).attr('r', 4).attr('stroke', 'black').attr('stroke-width', 1).attr('fill', 'black');  
      svgD.append('text').text(n).attr('class', 'targetmoelineblobtext').attr('x', x(targetmoe) + 5 ).attr('y', y(n) - 5 ).attr('text-anchor', 'start').attr('fill', 'black').attr('font-size', '1.6rem').attr('font-weight', 'bold');
    }

    if (tab === 'Unpaired' && ncurveudass) {
      svgD.append('circle').attr('class', 'targetmoelineblob').attr('cx', x(targetmoe)).attr('cy', y(n)).attr('r', 4).attr('stroke', 'red').attr('stroke-width', 1).attr('fill', 'red');  
      svgD.append('text').text(n).attr('class', 'targetmoelineblobtext').attr('x', x(targetmoe) + 5 ).attr('y', y(n) - 5 ).attr('text-anchor', 'start').attr('fill', 'red').attr('font-size', '1.6rem').attr('font-weight', 'bold');
    }

    if (tab === 'Paired' && ncurvepdavg) {
      svgD.append('circle').attr('class', 'targetmoelineblob').attr('cx', x(targetmoe)).attr('cy', y(n)).attr('r', 4).attr('stroke', 'black').attr('stroke-width', 1).attr('fill', 'black');  
      svgD.append('text').text(n).attr('class', 'targetmoelineblobtext').attr('x', x(targetmoe) + 5 ).attr('y', y(n) - 5 ).attr('text-anchor', 'start').attr('fill', 'black').attr('font-size', '1.6rem').attr('font-weight', 'bold');
    }

    if (tab === 'Paired' && ncurvepdass) {
      svgD.append('circle').attr('class', 'targetmoelineblob').attr('cx', x(targetmoe)).attr('cy', y(n)).attr('r', 4).attr('stroke', 'red').attr('stroke-width', 1).attr('fill', 'red');  
      svgD.append('text').text(n).attr('class', 'targetmoelineblobtext').attr('x', x(targetmoe) + 5 ).attr('y', y(n) - 5 ).attr('text-anchor', 'start').attr('fill', 'red').attr('font-size', '1.6rem').attr('font-weight', 'bold');
    }

    //draw a blob and N value at assuranceintersection
    // if (ncurveudass || ncurvepdass) {
    //       //draw a blob and N value at intersection

    //   if (tab === 'Unpaired' && ncurveudass) {
    //     svgD.append('circle').attr('class', 'targetmoelineblobAss').attr('cx', x(targetmoe)).attr('cy', y(n)).attr('r', 4).attr('stroke', 'red').attr('stroke-width', 1).attr('fill', 'red');  
    //     svgD.append('text').text(n).attr('class', 'targetmoelineblobtextAss').attr('x', x(targetmoe) + 10 ).attr('y', y(n) - 7 ).attr('text-anchor', 'start').attr('fill', 'red').attr('font-weight', 'bold');
    //   }

    //   if (tab === 'Paired' && ncurvepdass) {
    //     svgD.append('circle').attr('class', 'targetmoelineblobAss').attr('cx', x(targetmoe)).attr('cy', y(n)).attr('r', 4).attr('stroke', 'red').attr('stroke-width', 1).attr('fill', 'red');  
    //     svgD.append('text').text(n).attr('class', 'targetmoelineblobtextAss').attr('x', x(targetmoe) + 10 ).attr('y', y(n) - 7 ).attr('text-anchor', 'start').attr('fill', 'red').attr('font-weight', 'bold');
    //   }

    // }

  }

  function drawMoECurve() {
    d3.selectAll('.moecurve').remove();

    let moedist = [];
    let y;
    let f;
    let f2; //(^2/() in Excel)
    let n;
    let df;
    let Rcum;


    for (let fmoe = 0; fmoe < fmoemax; fmoe += fmoeinc) {

      //get n for fmoe
      if (tab === 'Unpaired') {
        if (ncurveudavg) {
          for (let i = 0; i < Nline.length; i += 1) {
            if (Math.abs(targetmoe - Nline[i].fmoe) < 0.001) {
              n = Nline[i].N;
              break;
            }
          }    
        }

        if (ncurveudass) {
          for (let i = 0; i < NlineAss.length; i += 1) {
            if (Math.abs(fmoe - NlineAss[i].fmoe) < 0.001) {
              n = NlineAss[i].N;
              break;
            }
          }    
        }

      }
      if (tab === 'Paired') {
        if (ncurvepdavg) {
          for (let i = 0; i < Nline.length; i += 1) {
            if (Math.abs(fmoe - Nline[i].fmoe) < 0.001) {
              n = Nline[i].N;
              break;
            }
          }    
        }

        if (ncurvepdass) {
          for (let i = 0; i < NlineAss.length; i += 1) {
            if (Math.abs(fmoe - NlineAss[i].fmoe) < 0.001) {
              n = NlineAss[i].N;
              break;
            }
          }
    
        }
      }
     
      df = 2*n - 2;

      if (tab === 'Unpaired') f = Math.sqrt( 2 / n) * Math.abs( jStat.studentt.inv( alphaud/2, df));
      if (tab === 'Paired')   f = Math.sqrt( 2 * (1 - correlationrho) / df) * Math.abs( jStat.studentt.inv( alphapd/2, df));

      f2 = (fmoe * fmoe) / (f * f / df);

      Rcum = 1 - jStat.chisquare.cdf(f2, df);


      moedist.push( { fmoe: fmoe.toFixed(3), f2: f2, Rcum: Rcum, ord: 0, N: 0 })
    }
    
    //now scan and obtain the ordinate value
    let ord;
    for (let i = 1; i < moedist.length - 1; i += 1) {
      ord = (moedist[i-1].Rcum - moedist[i+1].Rcum) / (2 * fmoeinc);
      moedist[i].ord = ord;
      moedist[i].N = 1 * ord;

      //lg(moedist[i].fmoe + ' --> ' + moedist[i].f2 + ' --> ' + moedist[i].Rcum + ' --> ' + moedist[i].ord + ' --> ' + moedist[i].N); 
    }

    svgD.append('path').attr('class', 'Nline').attr('d', line(moedist)).attr('stroke', 'orange').attr('stroke-width', 2).attr('fill', 'none');

  }

  /*---------------------------------------------Tab 1 Panel 2 N Curves radio button-------------------*/

  $ncurveudavg.on('change', function() {
    ncurveudavg = true;
    ncurveudass = false;

    drawNline();
    drawTargetMoELine();
    drawMoECurve();
  })

  $ncurveudass.on('change', function() {
    ncurveudavg = false;
    ncurveudass = true;

    drawNline();
    drawTargetMoELine();
    drawMoECurve();
  })

  /*---------------------------------------------Tab 1 Panel 3 Display Values checkbox-------------------*/

  $displayvaluesud.on('change', function() {
    displayvaluesud = $displayvaluesud.is(':checked');
    
    drawNline();
    drawTargetMoELine();
    drawMoECurve();
  })

  /*---------------------------------------------Tab 1 Panel 4 Truncate MoE----------------------------*/

  /*-------------------------------------------- Tab 1 Panel 5 CIs-------------------------------------*/

  $CIud.on('change', function() {
    alphaud = parseFloat($CIud.val()); 
    drawNline();
    drawTargetMoELine();    
    drawMoECurve();
  })

  /*---------------------------------------------Tab 2 Panel 1 Target MoE------------------------------*/

  /*---------------------------------------------Tab 2 Panel 2 N Curves radio button-------------------*/

  $ncurvepdavg.on('change', function() {
    ncurvepdavg = true;
    ncurvepdass = false;

    drawNline();
    drawTargetMoELine();
    drawMoECurve();
  })

  $ncurvepdass.on('change', function() {
    ncurvepdavg = false;
    ncurvepdass = true;

    drawNline();
    drawTargetMoELine();
    drawMoECurve();
  })

  /*---------------------------------------------Tab 2 Panel 4 Display Values checkbox-------------------*/

  $displayvaluespd.on('change', function() {
    displayvaluespd = $displayvaluespd.is(':checked');

    drawNline();
    drawTargetMoELine();
    drawMoECurve();
  })

  /*---------------------------------------------Tab 2 Panel 5 Truncate MoE----------------------------*/

 /*--------------------------------------------- Tab 2 Panel 6 CIs-------------------------------------*/

 $CIpd.on('change', function() {
  alphapd = parseFloat($CIpd.val()); 
  drawNline();
  drawTargetMoELine();  
  drawMoECurve();  
})

  // #region  -----------------------------------Nudge bars ------------------------------------------------

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
    targetmoe -= 0.005;
    if (targetmoe < 0.05) targetmoe = 0.05;
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
    targetmoe += 0.005;
    if (targetmoe > 2.0) targetmoe = 2.0;
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
    if (truncatedisplayud < 0.05) {
      truncatedisplayud = 0.05;
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
    if (truncatedisplayud < 0.05) truncatedisplayud = 0.05;
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
    if (truncatedisplaypd < 0.05) {
      truncatedisplaypd = 0.05;
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
    if (truncatedisplaypd < 0.05) truncatedisplaypd = 0.05;
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
    if (correlationrho < 0) {
      correlationrho = 0;
    }
    if (correlationrho > 0.99) {
      correlationrho = 0.99;
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
    if (correlationrho < 0 ) correlationrho = 0;
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
    if (correlationrho > 0.99) correlationrho = 0.99;
    $correlationrhoval.val(correlationrho.toFixed(2));
    updatecorrelationrho();
  }

  function updatecorrelationrho() {
    $correlationrhoslider.update({
      from: correlationrho
    })
    redrawDisplay();
  }

  //#endregion

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

