import AppKit

// Editable vector master: an open book that also reads as M, with a gold bookmark.
// Render directly into an opaque bitmap. NSImage.lockFocus() can produce a blank
// image in a non-interactive build. iOS applies its own corner mask at install time.
let size = 1024
guard CommandLine.arguments.count == 2 else {
    fatalError("Usage: swift create-icon.swift /path/to/AppIcon.png")
}
let drawing = CGContext(data: nil, width: size, height: size, bitsPerComponent: 8,
    bytesPerRow: size * 4, space: CGColorSpace(name: CGColorSpace.sRGB)!,
    bitmapInfo: CGImageAlphaInfo.noneSkipLast.rawValue)!
let context = NSGraphicsContext(cgContext: drawing, flipped: false)
NSGraphicsContext.saveGraphicsState()
NSGraphicsContext.current = context
context.shouldAntialias = true
context.imageInterpolation = .high

func color(_ hex: UInt32) -> NSColor {
    NSColor(srgbRed: CGFloat((hex >> 16) & 255) / 255,
        green: CGFloat((hex >> 8) & 255) / 255,
        blue: CGFloat(hex & 255) / 255, alpha: 1)
}

let canvas = NSRect(x: 0, y: 0, width: size, height: size)
NSGradient(starting: color(0x173D32), ending: color(0x2E7057))!
    .draw(in: canvas, angle: 90)

func page(left: Bool) -> NSBezierPath {
    let path = NSBezierPath()
    // The two sides share a curved page profile and retain a clear central spine.
    func p(_ x: CGFloat, _ y: CGFloat) -> NSPoint {
        NSPoint(x: left ? x : CGFloat(size) - x, y: y)
    }
    path.move(to: p(218, 710))
    path.curve(to: p(494, 648), controlPoint1: p(326, 744), controlPoint2: p(426, 714))
    path.line(to: p(494, 306))
    path.curve(to: p(218, 366), controlPoint1: p(414, 368), controlPoint2: p(312, 396))
    path.curve(to: p(198, 383), controlPoint1: p(206, 362), controlPoint2: p(198, 370))
    path.line(to: p(198, 685))
    path.curve(to: p(218, 710), controlPoint1: p(198, 699), controlPoint2: p(204, 706))
    path.close()
    return path
}

let leftPage = page(left: true)
let rightPage = page(left: false)
// The lower cover is an explicit vector offset, so rendering is deterministic.
for original in [leftPage, rightPage] {
    let cover = original.copy() as! NSBezierPath
    let offset = AffineTransform(translationByX: 0, byY: -24)
    cover.transform(using: offset)
    color(0x112F27).setFill()
    cover.fill()
}
color(0xFAF6E9).setFill(); leftPage.fill()
color(0xC5DDC8).setFill(); rightPage.fill()

// Three large, legible word strokes; no text or font dependency in the artwork.
color(0x668777).setStroke()
for y: CGFloat in [616, 542, 468] {
    let line = NSBezierPath()
    line.move(to: NSPoint(x: 263, y: y))
    line.curve(to: NSPoint(x: 431, y: y - 28),
        controlPoint1: NSPoint(x: 321, y: y + 7), controlPoint2: NSPoint(x: 383, y: y - 4))
    line.lineWidth = 20
    line.lineCapStyle = .round
    line.stroke()
}

// The bookmark is the small warm signature against the forest/porcelain palette.
let bookmark = NSBezierPath()
bookmark.move(to: NSPoint(x: 651, y: 724))
bookmark.curve(to: NSPoint(x: 719, y: 730),
    controlPoint1: NSPoint(x: 675, y: 730), controlPoint2: NSPoint(x: 695, y: 732))
bookmark.line(to: NSPoint(x: 719, y: 583))
bookmark.line(to: NSPoint(x: 685, y: 610))
bookmark.line(to: NSPoint(x: 651, y: 578))
bookmark.close()
color(0xD9B873).setFill(); bookmark.fill()

context.flushGraphics()
NSGraphicsContext.restoreGraphicsState()
let bitmap = NSBitmapImageRep(cgImage: drawing.makeImage()!)
// Fail before replacing the real icon if drawing ever regresses to a blank bitmap.
let corner = bitmap.colorAt(x: 0, y: 0)!.usingColorSpace(.deviceRGB)!
let paper = bitmap.colorAt(x: 340, y: 500)!.usingColorSpace(.deviceRGB)!
precondition(corner.greenComponent > corner.redComponent && paper.redComponent > 0.8,
    "Icon rendering failed: expected a forest canvas and a light book page")
let destination = URL(fileURLWithPath: CommandLine.arguments[1])
try bitmap.representation(using: .png, properties: [:])!.write(to: destination, options: .atomic)
print("Created opaque 1024 x 1024 Mots icon: \(destination.path)")
