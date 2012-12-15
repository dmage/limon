({
    block: 'b-page',
    title: 'Simple chart',
    head: [
        { elem: 'css', url: '_limon.css'},
        { elem: 'css', url: '_limon.ie.css', ie: 'lt IE 8' },
        { block: 'i-jquery', elem: 'core' },
        { elem: 'js', url: '_limon.bemhtml.js' },
        { elem: 'js', url: '_limon.js' }
    ],
    content: [
        {
            block: 'b-text',
            elem: 'h1',
            content: 'Simple chart'
        },
        {
            block: 'b-chart',
            title: 'Loading...',
            settingsProvider: {
                name: 'b-chart__static-settings-provider',
                title: 'Simple chart',
                xAxes: [
                    {
                        pos: 'bottom',
                        scale: 'b-scale__linear',
                        rangeProvider: {
                            name: 'i-time-range-provider',
                            period: 600,
                            updateInterval: 10000
                        },
                        units: "unixtime"
                    }
                ],
                yAxes: [
                    {
                        pos: 'left',
                        scale: 'b-scale__linear',
                        rangeProvider: {
                            name: 'b-chart__data-range-provider'
                        }
                    }
                ],
                items: [
                    {
                        name: 'dmage-host: net.eth0.rx',
                        xAxis: 0,
                        yAxis: 0,
                        color: '#393',
                        dataProvider: {
                            name: 'my-data-provider',
                            object: 'dmage-host',
                            signal: 'net.eth0.rx'
                        }
                    }
                ],
                overlays: [
                    { name: 'b-chart-overlay__grid' },
                    {
                        name: 'b-chart-overlay__render',
                        renderName: 'b-chart-render__fill'
                    },
                    {
                        name: 'b-chart-overlay__render',
                        renderName: 'b-chart-render__line',
                        colorMixin: '#000'
                    },
                    { name: 'b-chart-overlay__tooltip' }
                ]
            }
        }
    ]
})
