This is a sample repo to reproduce the bug when breakpoints under some circumstances are causing debugging to crash

## Steps to reproduce

1. Open this repo in VSCode
2. Hit F5 to start debugging
3. After debugger attaches, put breakpoints in `index.android.bundle` on lines 1498 and 1502
4. Hit F5 to continue execution. Debug will stop on the first breakpoint
5. Continue execution by pressing F5 again

  Instead of stopping on the breakpoint, debug session breaks and the following message is logged in debug console:

  ```
#
# Fatal error in runtime\runtime-debug.cc, line 1423
# Check failed: args[0]->IsJSObject().
#

==== C stack trace ===============================

        v8::Testing::DeoptimizeAll [0x00007FF78E61D346+1835286]
        v8::Testing::DeoptimizeAll [0x00007FF78E7C9EFD+3591373]
        (No symbol) [0x000001C9699063AB]
  ```

## Some additional observations:

  - This only reproduces in Node 7.x (Node 6.x affected by other bug, reported in [nodejs/node/#8347](https://github.com/nodejs/node/issues/8347))
  - After additional investigation it looks like the debugger is actually stops on the breakpoint (as opposite to nodejs/node/#8347) and reports event
to extension but then crashes when debug extension sends requests to get stack, variables etc.

