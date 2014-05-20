/**
 * Puppet Brush for SyntaxHighlighter
 *
 * @copyright
 * Copyright (C) 2014 Evernote Corporation. All rights reserved.
 * Copyright (C) 2004-2010 Alex Gorbatchev.
 *
 * SyntaxHighlighter
 * http://alexgorbatchev.com/SyntaxHighlighter
 *
 * SyntaxHighlighter is donationware. If you are using it, please donate.
 * http://alexgorbatchev.com/SyntaxHighlighter/donate.html
 *
 * @version
 * 0.9 (May 2014)
 *
 * @license
 * Dual licensed under the MIT and GPL licenses.
 */
;
(function()
{
    // CommonJS
    typeof(require) != 'undefined' ? SyntaxHighlighter = require('shCore').SyntaxHighlighter : null;

    function Brush()
    {
        // Perl Brush Contributed by David Simmons-Duffin and Marty Kube

        var funcs =
            'alert collect contain create_resources crit debug defined each ' +
            'emerg epp err extlookup fail file filter fqdn_rand generate hiera ' +
            'hiera_array hiera_hash hiera_include include info inline_epp ' +
            'inline_template lookup map md5 notice realize reduce regsubst ' +
            'search select sha1 shellquote slice split sprintf ' +
            'tag tagged template versioncmp warning ' +
            'user file cron service package';

        var keywords =
            'and case class default define else elsif false if in import ' +
            'inherits node or true undef unless';

        function extract(subMatch, cssClass)
        {
            return function(match, regexInfo)
            {
                var matcher = SyntaxHighlighter.Match;

                return [new matcher(match[subMatch], match.index +
                    match[0].indexOf(match[subMatch]), cssClass)]
            }
        }

        function extract_1_color1(match, regexInfo)
        {
            var matcher = SyntaxHighlighter.Match;

            return [new matcher(match[1], match.index + match[0].indexOf(match[1]), 'functions')]
        }

        this.regexList = [
            {
                regex: new RegExp('#[^!].*$', 'gm'),
                css: 'comments'
            }, // same as perl
            {
                regex: SyntaxHighlighter.regexLib.doubleQuotedString,
                css: 'string'
            }, // same as perl
            {
                regex: new RegExp('class\\s[:\\w\\-]+', 'g'),
                // regex: /class\s[:\w\-]+/i,
                css: 'puppetclass'
            },
            {
                regex: SyntaxHighlighter.regexLib.singleQuotedString,
                css: 'string'
            }, // same as perl
            {
                regex: new RegExp('(\\$\\w+|\\${[^}]})', 'g'),
                css: 'variable'
            },
            {
                regex: new RegExp('^\\s *([a-z][a-zA-Z0-9_:-]*)\\s+{', 'gm'),
                func: extract(1, 'functions')
            },
            {
                regex: new RegExp(this.getKeywords(funcs), 'gmi'),
                css: 'functions'
            },
            {
                regex: new RegExp(this.getKeywords(keywords), 'gm'),
                css: 'keyword'
            }

        ];

        this.forHtmlScript(SyntaxHighlighter.regexLib.phpScriptTags);
    }

    Brush.prototype = new SyntaxHighlighter.Highlighter();
    Brush.aliases = ['puppet', 'Puppet', 'pp'];

    SyntaxHighlighter.brushes.Puppet = Brush;

    // CommonJS
    typeof(exports) != 'undefined' ? exports.Brush = Brush : null;
})();