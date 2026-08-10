---
id: linux-one-year-review
title: A Year of Using Linux as My Main Machine
summary: Forced into Linux by a broken Windows bootloader in July 2025, I tried multiple distros over the next year. After stumbling through dependency hell, driver issues, and slow mirrors, I landed on Debian 12. This post documents my distro-hopping journey and final choice.
date: 2026-08-10
tags:
  - System
  - Linux
readTime: 7 min
---

I started using Linux as my main operating system on July 12, 2025. The reason? See the image below:

![](https://cloudflarecnimg.scdn.io/i/6a792692186f1_1786324626.webp)

Before that, I had a dual‑boot setup with Windows 10 and Linux. But on that day, Windows' bootloader broke and wouldn't start. So I had no choice but to boot into Linux, wipe Windows, and officially go Linux‑only.

## The Journey

### The First Linux Distro I Used

> As a complete Linux newbie, I knew nothing about distributions. My selection criterion was simple and naive: whichever looked nicest in a Bilibili video, I'd install. So my first system was a third‑party Ubuntu‑based distro with fancy theming. At first glance, it was indeed eye‑candy.

But soon came a string of "newbie starter pack" issues:

- I didn't know I should switch to domestic mirrors for software sources, so updates were painfully slow—around a few hundred KB/s.
- I didn't realise many tools needed separate proxy configuration, so the command line kept timing out.
- I had no clue how complex dependency relationships could be. Following AI advice, I ran `apt upgrade` and was greeted with a flood of errors.

---

### The Second Linux Distro

That first system lasted about a month (I don't recall exactly). Eventually, dependency conflicts became a real headache, though the system was still usable. Around that time, I often watched videos on Bilibili and thought Ubuntu looked pretty good, so I casually flashed Ubuntu. Initially, the experience was great—well‑known distributions are indeed much more hassle‑free than obscure ones, with fewer quirks. I used it throughout August.

But in September, one day after booting, I found that drivers had vanished—the network (Wi‑Fi) driver was dead, leaving the computer completely offline, and several other system components were broken too. The machine could only show a blank desktop with a terminal left, though USB ports still worked. I desperately needed a computer at that moment, and there was no spare at home. I was anxious, but still unfamiliar with Linux and had no idea how to fix things. I was stuck.

---

### The Third Linux Distro

Right after Ubuntu broke, I had to download the Debian 13 netinstall image on my phone. It was recommended by a pro I knew, whose online handle is **mxdyeah**—I won't go into details. After downloading, I transferred the image to my computer via USB, flashed it onto a USB drive, and started the installation. The same guy guided me through the whole process remotely, including showing me how to switch mirrors—this cut the estimated three‑hour download down to about an hour, so the installation went smoothly. I heard he's one of the Debian Chinese developers.

Once installed, I went about daily use. I tinkered with some KDE theming packages, turning the whole system interface into a macOS lookalike—bottom dock, window controls, icons, desktop—essentially an Apple‑style makeover. It looked great, though whenever I shared screenshots of code or web pages, people often mistook it for actual macOS. This setup accompanied me for quite a long time, all the way through to the summer of 2026, i.e., July.

Around that time, I was playing **Minecraft** with friends using the **HMCL** launcher. Everything worked fine at first, and since I never shut down the machine, I didn't notice any issues until the third day. I restarted VScode (it had become unresponsive), only to find that many apps had stopped working—Firefox, VScode, several system components, and even the sound driver were gone. After some investigation, I determined that HMCL had upgraded certain system dependencies, causing conflicts, and the system automatically removed the configurations of the affected applications.

I planned to fix it myself—by then I was somewhat familiar with Linux, not an expert but capable of routine maintenance. I started downgrading dependencies, but the network acted up again: mirror switches hung, and my VPN wouldn't start due to dependency issues. Staring at a few hundred KB/s speed, and realising I'd have to replace dozens of dependencies, I decided it wasn't worth the time (I also had online classes to attend, which required a browser). So I simply reinstalled the system.

---

### The Fourth Linux Distro

After that, I downloaded the Debian 12 installation image. The installer looked almost the same as Debian 13's. I picked what seemed like the 4GB offline version, which didn't need network downloads, thus avoiding the mirror‑switching step altogether. It's been running smoothly ever since. This time I didn't bother with theming—just stuck with stock KDE, which feels quite pleasant. The only hiccup is that **Breezell** IDE has relatively high dependency requirements; after installing it, the system settings panel won't open. Apart from that, everything works fine.
> If you don't know Breezell, [check out their website](https://breezell.com).

![Current desktop](https://cloudflarecnimg.scdn.io/i/6a7933405077a_1786327872.webp)

---

## Linux on Servers

I'd heard that Debian 12 is exceptionally stable, so I switched all my servers to it as well. Using it both on the desktop and servers naturally made me more and more familiar with it over time.

---

## Epilogue

From July 2025 until now, it's been just over a year of running Linux as my daily driver. Looking back, if that Windows bootloader hadn't broken, I'd probably still be dual‑booting, occasionally popping into Linux for fun then returning to the comfort zone of Windows. That boot failure forced me out of my comfort zone—but it also became the most important turning point in my Linux journey.

Now, if someone asks me, "Which Linux distro should a beginner choose?", I'd probably recommend **Debian 12** or **Ubuntu LTS** directly. Fancy themed derivatives are nice to look at, but it's better to start with a solid base and add theming on top if you like. Of course, if they're like me originally and just want it to look good—then maybe they'd be better off sticking with Windows.

Will I switch again in the future? Hard to say. For now, Debian 12 works so well that I have no plans to move. If something does blow up someday... well, I'll deal with it then. At least I've gained enough experience to just reinstall—no big deal.