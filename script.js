

        const CONFIG = {
            logDelayInterval: 1.5,
            gridConfig: [8, 8, 6, 6, 6, 6, 6, 3],
            reducedGridConfig: [4, 4, 3, 2, 2, 2, 2, 1],
            blockAnimationDuration: 1000,
            blockSlideOutDelay: 50,
            availableBlocks: ['block-a', 'block-b', 'block-c', 'block-d', 'block-e', 'block-f'],
            staticBlockPositions: [[1, 2], [1, 5], [4, 1], [5, 4], [6, 0]],
            falseSquares: {
                normal: [[0, 0], [3, 0], [5, 0]],
                reduced: [[0, 0], [4, 0]]
            }

        };

        const utils = {
            isReducedGridMode: () => window.innerWidth <= 1028,
            prefersReducedMotion: () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
            formatTime: (date) => date.toTimeString().split(' ')[0],
            getRandomBlock: () => {
                const randomIndex = Math.floor(Math.random() * CONFIG.availableBlocks.length);
                const blockId = CONFIG.availableBlocks[randomIndex];
                const blockImg = document.getElementById(blockId);

                if (!(blockImg instanceof HTMLImageElement))
                    return;

                return blockImg ? blockImg.src : '';
            }
            ,
            createElement: (tag, className, textContent = '') => {
                const element = document.createElement(tag);
                if (className)
                    element.className = className;
                if (textContent)
                    element.textContent = textContent;
                return element;
            }
        };

        let initialBlockAssignments = null;

        const logEntries = [{
            type: "ascii",
            content: `
__| |_________________________________________________________________________________________________________________________| |__
__   _________________________________________________________________________________________________________________________   __
  | |                                                                                                                         | |
  | |                                                                                                                         | |
  | |                                                                                                                         | |
  | |      ___       __       _______       ___           ________      ________      _____ ______       _______              | |
  | |     |\\  \\     |\\  \\    |\\  ___ \\     |\\  \\         |\\   ____\\    |\\   __  \\    |\\   _ \\  _   \\    |\\  ___ \\             | |
  | |     \\ \\  \\    \\ \\  \\   \\ \\   __/|    \\ \\  \\        \\ \\  \\___|    \\ \\  \\|\\  \\   \\ \\  \\\\\\__\\ \\  \\   \\ \\   __/|            | |
  | |      \\ \\  \\  __\\ \\  \\   \\ \\  \\_|/__   \\ \\  \\        \\ \\  \\        \\ \\  \\\\\\  \\   \\ \\  \\\\|__| \\  \\   \\ \\  \\_|/__          | |
  | |       \\ \\  \\|\\__\\_\\  \\   \\ \\  \\_|\\ \\   \\ \\  \\____    \\ \\  \\____    \\ \\  \\\\\\  \\   \\ \\  \\    \\ \\  \\   \\ \\  \\_|\\ \\         | |
  | |        \\ \\____________\\   \\ \\_______\\   \\ \\_______\\   \\ \\_______\\   \\ \\_______\\   \\ \\__\\    \\ \\__\\   \\ \\_______\\        | |
  | |         \\|____________|    \\|_______|    \\|_______|    \\|_______|    \\|_______|    \\|__|     \\|__|    \\|_______|        | |
  | |                                                                                                                         | |
  | |                                                                                                                         | |
  | |                                                                                                                         | |
  | |                               T  O      M  Y      A  N  I  M  A  T  I  O  N      P  A  G  E                             | |
  | |                                                                                                                         | |
  | |                                                                                                                         | |
__| |_________________________________________________________________________________________________________________________| |__
__   _________________________________________________________________________________________________________________________   __
  | |                                                                                                                         | |`
        }, {
            text: " Initialising animation ...",
            timeOffset: 0
        }, {
            text: " Animation Started ...",
            timeOffset: 3
        }, {
            type: "empty"
        }, {
            text: " You can now play with the boxes ...",
            timeOffset: 7
        }, {
            type: "empty"
        }, {
            type: "empty"
        }, {
            type: "empty"
        }, {
            type: "empty"
        }, {
            text: " Hope you enjoyed playing with it ...",
            timeOffset: 12
        },];

        const animationManager = {
            clearTimeouts: (timeouts) => {
                Object.values(timeouts).forEach(timeout => clearTimeout(timeout));
            }
            ,

            handleSlideIn: (square, timeouts) => {
                animationManager.clearTimeouts(timeouts);

                if (square.classList.contains('showing') || square.classList.contains('sliding-in')) {
                    square.classList.remove('sliding-out');
                    return;
                }

                square.classList.remove('sliding-out');
                square.classList.add('sliding-in');

                timeouts.slideIn = setTimeout(() => {
                    square.classList.remove('sliding-in');
                    square.classList.add('showing');
                }
                    , CONFIG.blockAnimationDuration);
            }
            ,

            handleSlideOut: (square, timeouts) => {
                clearTimeout(timeouts.slideIn);

                if (square.classList.contains('sliding-in')) {
                    timeouts.slideIn = setTimeout(() => {
                        square.classList.remove('sliding-in');
                        square.classList.add('showing');
                        setTimeout(() => {
                            square.classList.remove('showing');
                            square.classList.add('sliding-out');
                            timeouts.slideOut = setTimeout(() => {
                                square.classList.remove('sliding-out');
                            }
                                , CONFIG.blockAnimationDuration);
                        }
                            , CONFIG.blockSlideOutDelay);
                    }
                        , CONFIG.blockAnimationDuration);
                    return;
                }

                square.classList.remove('showing');
                square.classList.add('sliding-out');
                timeouts.slideOut = setTimeout(() => {
                    square.classList.remove('sliding-out');
                }
                    , CONFIG.blockAnimationDuration);
            }
        };

        const gridManager = {
            initializeBlockAssignments() {
                if (initialBlockAssignments)
                    return;

                initialBlockAssignments = new Map();
                [CONFIG.gridConfig, CONFIG.reducedGridConfig].forEach((config, configIndex) => {
                    config.forEach((squareCount, rowIndex) => {
                        for (let i = 0; i < squareCount; i++) {
                            const key = `${configIndex}-${rowIndex}-${i}`;
                            initialBlockAssignments.set(key, utils.getRandomBlock());
                        }
                    }
                    );
                }
                );
            },

            getStoredBlock(rowIndex, squareIndex) {
                const configIndex = utils.isReducedGridMode() ? 1 : 0;
                const key = `${configIndex}-${rowIndex}-${squareIndex}`;
                return initialBlockAssignments.get(key);
            },

            recreateGrid() {
                const gridContainer = document.getElementById('grid-container');
                if (!gridContainer)
                    return;
                gridContainer.innerHTML = '';
                createGrid();
            }
        };

        function createGrid() {
            const gridContainer = document.getElementById('grid-container');
            const isReduced = utils.isReducedGridMode();
            const currentGridConfig = isReduced ? CONFIG.reducedGridConfig : CONFIG.gridConfig;
            const enableHoverEffects = !isReduced && !utils.prefersReducedMotion();
            const falseSquares = isReduced ? CONFIG.falseSquares.reduced : CONFIG.falseSquares.normal;

            gridManager.initializeBlockAssignments();

            currentGridConfig.forEach((squareCount, rowIndex) => {
                const row = utils.createElement('div', 'grid-row');

                for (let i = 0; i < squareCount; i++) {
                    const square = utils.createElement('div', 'grid-square');
                    const needsHangingBorder = falseSquares.some(([r, s]) => r === rowIndex && s === i);

                    if (needsHangingBorder) {
                        square.classList.add('false-square');
                        square.appendChild(utils.createElement('div', 'hanging-border'));
                    } else {
                        const storedBlock = gridManager.getStoredBlock(rowIndex, i);
                        square.style.setProperty('--block-image', `url("${storedBlock}")`);

                        const shouldShowStaticBlock = !isReduced && utils.prefersReducedMotion() && CONFIG.staticBlockPositions.some(([r, s]) => r === rowIndex && s === i);

                        if (shouldShowStaticBlock) {
                            square.classList.add('showing');
                        }

                        if (enableHoverEffects) {
                            const timeouts = {
                                slideIn: null,
                                slideOut: null
                            };

                            square.addEventListener('mouseenter', () => {
                                animationManager.handleSlideIn(square, timeouts);
                            }
                            );

                            square.addEventListener('mouseleave', () => {
                                animationManager.handleSlideOut(square, timeouts);
                            }
                            );
                        }
                    }

                    row.appendChild(square);
                }

                if (!gridContainer)
                    return;

                gridContainer.appendChild(row);
            }
            );
        }

        const logEntryCreators = {
            ascii: (entry) => {
                const logText = utils.createElement('span', 'log-text');
                const pre = utils.createElement('pre', '', entry.content);
                logText.appendChild(pre);
                return [logText];
            }
            ,

            empty: () => [],

            regular: (entry, currentTime) => {
                const entryTime = new Date(currentTime.getTime() + (entry.timeOffset * 1000));
                const timestamp = utils.createElement('span', 'timestamp', utils.formatTime(entryTime));
                const logText = utils.createElement('span', 'log-text', entry.text);
                return [timestamp, logText];
            }
        };

        function createLogEntries() {
            const logContainer = document.getElementById('log-container');
            const totalDuration = logEntries.length * CONFIG.logDelayInterval;
            const currentTime = new Date();

            if (!logContainer)
                return;

            logContainer.style.setProperty('--total-duration', `${totalDuration}s`);

            logEntries.forEach((entry, index) => {
                const logEntry = utils.createElement('div', 'log-entry');
                const delay = index * CONFIG.logDelayInterval;

                logEntry.style.setProperty('--entry-delay', `${delay}s`);

                let elements = [];
                if (entry.type === 'ascii') {
                    logEntry.classList.add('ascii-art');
                    elements = logEntryCreators.ascii(entry);
                } else if (entry.type === 'empty') {
                    elements = logEntryCreators.empty();
                } else {
                    elements = logEntryCreators.regular(entry, currentTime);
                }

                elements.forEach(element => logEntry.appendChild(element));

                if (index === logEntries.length - 1) {
                    logEntry.classList.add('last-entry');
                }

                logContainer.appendChild(logEntry);
            }
            );
        }

        document.addEventListener('DOMContentLoaded', () => {
            createGrid();
            createLogEntries();
        });

        window.addEventListener('resize', gridManager.recreateGrid);

        window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', gridManager.recreateGrid);

        const intervalTimeout = 5000;

        const overallTimeout = 45_000;
        async function testIfServerIsUp() {
            const controller = new AbortController();
            const queryTimeout = 4000;
            setTimeout(() => {
                controller.abort()
            }
                , queryTimeout);
            const url = window.location.href;
            try {
                const response = await fetch(url, {
                    method: "HEAD",
                    signal: controller.signal,
                    mode: "no-cors",
                })
                if (response && response.status !== 503) {
                    window.location.replace(url);
                }
            } catch { }
        }
        //setInterval(testIfServerIsUp, intervalTimeout);
        //setTimeout( () => window.location.reload(), overallTimeout);
    
