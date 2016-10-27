This is a sample repo to reproduce the bug when stop on breakpoint is not being reported by node debugger in some situations. For details see [Microsoft/vscode-react-native/#273](https://github.com/Microsoft/vscode-react-native/issues/273)

## Steps to reproduce

1. Run `debuggerStub.js` in remote debugging mode:

    node --debug --debug-brk debuggerStub.js

2. Run new node debug client and attach to debugger:

    node debug localhost:5858

3. After attaching to debugger set the breakpoints in debug client:

    sb(51)
    sb('index.android.bundle', 1502)
    sb('index.android.bundle', 1498)

4. Start execution by typing `c` in debug client console

  You'll see that debug will stop on the first breakpoint and print current line to console:

```
break in d:\PROJECTS\Temp\react_debug_mock\debuggerStub.js:51
 49 let sandboxContext = vm.createContext(sandbox);
 50
>51 runInContext(debuggerWorker, sandboxContext);
 52
 53 const postMessageScript = new vm.Script("onmessage({ data: postMessageArgument });");
```

5. Continue execution by typing `c` again

  Debug will stop on the second breakpoint and print current line:

```
break in d:\PROJECTS\Temp\react_debug_mock\index.android.bundle:1502
 1500
 1501 {
>1502 return(
 1503 _react2.default.createElement(_reactNative.View,{onTouchEnd:this.handleTap.bind(this)},
 1504 _react2.default.createElement(_reactNative.Text,null,'Lorem ipsum dolor sit amet, consectetur ...
```

6. Continue execution by typing `c` again

  Debug console stays clear, current line is never printed.
  'yo' is printed to debug server's console which means that line before 1498 was executed
  'hello' is not printed hence line 1498 is not executed

7. Try to continue execution by typing `c` once more

  'hello' is printed to debug console - script continues to execute

## Some additional observations:

  - This doesn't reproduce when script is debugged using `node debug`, i.e. when client and server is the same process
  - This only reproduce in Node 6.x (neither 4.x nor 7.x is not affected)
  - When using alternative debugging client (VSCode) it appears that node does not emit 'breakpoint' event into socket. After sending 'suspend' request node process reports 'breakpoint' event as it was stopped on breakpoint before suspending.

