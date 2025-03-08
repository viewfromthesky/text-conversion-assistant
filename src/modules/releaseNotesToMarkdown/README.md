# Module: "releaseNotesToMarkdown"

Conversion script to take in release notes written in the excellent
[Bike](https://www.hogbaysoftware.com/bike/) outliner, and convert to
Markdown, which is more ubiquitous.

## Requirements
* Should take in a `.bike` HTML file and convert it to Markdown and
  Slack's own bastardised version of markdown
    * It may make sense in the future to allow specifying an input
      format *and* output format separately. For now, this is being
      designed for a very specific purpose.
        * If this does happen, the input format default should remain
          the `.bike` format (which is still valid HTML).
* The output type should be optional, so assume regular markdown by
  default, and include a "dialect" switch

## Flags
### versions (`-v`|`--versions`)
Takes in the desired comma-separated list of version numbers and formats
all together
*e.g.*

```--versions 2025.10,2025.04.005,2025.09```

### Week (`-w`|`--week`)
Takes in the desired week number (files are separated by year) and
formats all versions contained within. This can be more than one for
each mainline and LTS
*e.g.*

```--week 10```

### dialect (`-d`|`--dialect`)
Defines the Markdown sub/superset to use. By default, [Gruber's original
Markdown][gruber_md] spec is used.

#### Selections
* `default`: [Gruber's Markdown][gruber_md], used implicitly
* `slack`: Slack's subset/remix of the markdown syntax. They call it
  Markdown, but it isn't really.

[gruber_md]: https://daringfireball.net/projects/markdown/
