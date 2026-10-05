from pathlib import Path
from datetime import datetime, timezone, timedelta
from zipfile import ZipFile, ZIP_DEFLATED
from PIL import Image, ImageDraw, ImageFont
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.pagesizes import A4
from reportlab.lib.utils import ImageReader
from pypdf import PdfReader
import pypdfium2 as pdfium

ROOT = Path(__file__).resolve().parent
FONT = 'C:/Windows/Fonts/malgun.ttf'
pdfmetrics.registerFont(TTFont('Korean', FONT))
SHOTS = [
    ('01-가입전-첫화면-모바일.jpg', '01  가입 전 첫 화면', 'https://www.nurimind.co.kr/', '카카오 로그인 또는 닉네임 시작을 선택합니다. 닉네임 시작은 필수 동의 후 이용합니다.', None),
    ('05-홈-모바일.jpg', '02  닉네임 이용자의 홈', 'https://www.nurimind.co.kr/', '로그인하지 않은 게스트도 검사 메뉴에서 이용할 검사를 고를 수 있습니다.', 900),
    ('06-검사소개-모바일.jpg', '03  검사 소개', 'https://www.nurimind.co.kr/test/selfesteem', '검사의 문항 수, 예상 시간, 참고 척도와 이용 안내를 확인한 뒤 시작합니다.', None),
    ('07-검사문항-모바일.jpg', '04  문항 응답', 'https://www.nurimind.co.kr/test/selfesteem/run', '문항에 순서대로 답합니다. 이번 결과 시연은 10문항 모두 중립 응답으로 진행했습니다.', None),
    ('08-검사결과-모바일.jpg', '05  검사 결과', 'https://www.nurimind.co.kr/result/:결과ID', '실제로 완료한 시연 결과입니다. 새로고침과 프로필 이력에서 같은 결과를 재조회했습니다.', None),
    ('03-사업자정보.jpg', '06  사업자 정보 — 가입 없이 공개', 'https://www.nurimind.co.kr/about', '서비스 소개 하단에서 상호, 대표자, 등록번호, 사업장 주소와 연락처를 확인합니다.', None),
    ('12-우편함-로그인안내.jpg', '07  계정 연동이 필요한 화면', 'https://www.nurimind.co.kr/mail', '우편함은 카카오 로그인 후 이용합니다. 카카오 로그인은 계정 식별과 계정 서비스 연동에 사용됩니다.', None),
]
for name, *_ in SHOTS:
    assert (ROOT / name).is_file(), name

def lines(c, text, x, y, size=10, width=500, gap=17):
    c.setFont('Korean', size)
    for paragraph in text.split('\n'):
        line = ''
        for ch in paragraph:
            if pdfmetrics.stringWidth(line + ch, 'Korean', size) > width:
                c.drawString(x, y, line)
                y -= gap
                line = ''
            line += ch
        c.drawString(x, y, line)
        y -= gap
    return y

pdf = ROOT / '누리마인드_카카오심사_서비스화면.pdf'
c = canvas.Canvas(str(pdf), pagesize=A4)
c.setTitle('누리 마인드 - 서비스 화면 및 이용 동선')
c.setAuthor('엔에이치홀딩스')
w, h = A4
def footer(page):
    c.setFillColorRGB(.35, .39, .44)
    lines(c, f'NURIMIND (앱 ID 1487085)  |  운영 사이트 실측 2026.10.06 KST  |  {page}', 36, 25, 8)
    c.setFillColorRGB(0, 0, 0)

lines(c, '누리 마인드\n서비스 화면 및 이용 동선', 42, h - 64, 24, gap=36)
y = lines(c, '카카오디벨로퍼스 비즈니스 정보 심사 보완 자료\n앱 이름: NURIMIND  /  앱 ID: 1487085\n서비스 주소: https://www.nurimind.co.kr/', 42, h - 158, 12, gap=23)
y = lines(c, '서비스 내용', 42, y - 22, 16)
y = lines(c, '공개 심리 척도와 인지 과제를 바탕으로 자신을 이해하도록 돕는 심리 콘텐츠 서비스입니다. 심리검사, 결과 해설, 심리 매거진, 운세 콘텐츠를 제공합니다. 검사 결과는 자기 성찰을 돕는 참고 자료이며 의학적 진단을 대신하지 않습니다.', 42, y - 12, 11, gap=21)
y = lines(c, '이용 동선', 42, y - 25, 16)
y = lines(c, '첫 화면 → 카카오 로그인 또는 닉네임 시작 → 필수 동의 → 홈\n홈 → 검사 소개 → 문항 응답 → 검사 결과 → 프로필에서 재열람\n가입 없이 확인: 서비스 소개, 사업자 정보, 이용약관, 개인정보처리방침\n계정 연동 기능: 카카오 로그인 후 포인트 및 우편함 이용', 42, y - 12, 11, gap=24)
y = lines(c, '운영 주체', 42, y - 25, 16)
y = lines(c, '엔에이치홀딩스 / 대표 김윤혜 / 사업자등록번호 525-20-02937\n문의: ace@nuriholdem.com / 전화: 070-8098-1727\n사업자 정보 공개 화면: https://www.nurimind.co.kr/about', 42, y - 12, 11, gap=23)
lines(c, '첨부 화면은 운영 사이트의 실제 화면입니다. 문항과 결과는 시연용 입력이며 이용자의 실제 심리 상태를 나타내지 않습니다. 카카오 계정 식별값·닉네임·프로필 사진·이메일을 통한 인증 연동이 설정되어 있습니다. 결제와 리워드 설문은 준비 중입니다.', 42, y - 20, 10, gap=18)
footer(1)
c.showPage()

for page, (name, title, url, desc, crop_h) in enumerate(SHOTS, 2):
    lines(c, title, 36, h - 43, 17)
    lines(c, url, 36, h - 65, 9)
    lines(c, desc, 36, h - 87, 10, gap=15)
    im = Image.open(ROOT / name).convert('RGB')
    if crop_h:
        im = im.crop((0, 0, im.width, min(im.height, crop_h)))
    factor = min(440 / im.width, 655 / im.height)
    iw, ih = im.width * factor, im.height * factor
    c.drawImage(ImageReader(im), (w - iw) / 2, 43 + (655 - ih) / 2, iw, ih)
    if crop_h:
        lines(c, '홈 전체 화면 중 검사 선택 영역. 원본은 함께 보관되어 있습니다.', 36, 38, 8)
    footer(page)
    c.showPage()
c.save()
reader = PdfReader(pdf)
assert len(reader.pages) == len(SHOTS) + 1
assert '누리 마인드' in reader.pages[0].extract_text()
assert pdf.stat().st_size < 20 * 1024 * 1024

board = Image.new('RGB', (2100, 2060), '#f3f6fa')
d = ImageDraw.Draw(board)
title_font = ImageFont.truetype(FONT, 54)
label_font = ImageFont.truetype(FONT, 30)
small_font = ImageFont.truetype(FONT, 25)
d.text((60, 35), '누리 마인드 · 실제 서비스 이용 동선', font=title_font, fill='#17243a')
d.text((60, 115), 'www.nurimind.co.kr  |  2026.10.06 KST  |  시연용 응답', font=small_font, fill='#46566d')
for index in range(6):
    name, title, _, _, crop_h = SHOTS[index]
    x, y = 60 + (index % 3) * 690, 190 + (index // 3) * 930
    d.rounded_rectangle((x, y, x + 650, y + 895), radius=18, fill='white')
    d.text((x + 20, y + 20), title, font=label_font, fill='#17243a')
    im = Image.open(ROOT / name).convert('RGB')
    if index in (0, 1):
        im = im.crop((0, 0, im.width, min(im.height, 930)))
    im.thumbnail((610, 800))
    board.paste(im, (x + (650 - im.width) // 2, y + 75))
board.save(ROOT / '00-이용동선-요약.png')

additional = '''누리 마인드(https://www.nurimind.co.kr/, NURIMIND 앱 ID 1487085)는 자기이해 심리검사·인지 과제, 심리 매거진과 운세 콘텐츠를 제공하는 웹 서비스입니다. 가입하지 않아도 /about에서 서비스 설명과 사업자 정보를, /legal/terms와 /legal/privacy에서 이용약관과 개인정보처리방침을 확인할 수 있습니다. 첫 화면에서 닉네임과 필수 동의를 입력하면 게스트로 검사 소개 → 문항 응답 → 결과를 이용할 수 있고, 카카오 로그인으로 계정 연동 기능을 이용할 수 있습니다. 첨부 PDF는 현재 운영 사이트를 실제 이용하며 촬영한 첫 화면·홈·검사 소개·문항·실제 결과·사업자 정보·우편함 로그인 안내입니다. 기존 반려 사유에서 요청하신 이용 동선과 사업자 정보 화면을 보완했습니다. 운영자는 엔에이치홀딩스(대표 김윤혜, 사업자등록번호 525-20-02937)입니다.'''
(ROOT / '추가정보_붙여넣기.txt').write_text(additional + '\n', encoding='utf-8-sig')
(ROOT / '제출방법.txt').write_text('NURIMIND (1487085) → 추가 기능 신청 → 비즈니스 정보 신청\n서비스 정보: https://www.nurimind.co.kr/\n서비스 화면: 누리마인드_카카오심사_서비스화면.pdf 1개 첨부\n추가 정보: 추가정보_붙여넣기.txt 문구 붙여넣기\n사업자등록증: 최신 실제 등록증 사본 별도 첨부(이 자료에는 등록증 사본이 없음)\n현재 폼: 첨부 항목별 최대 1파일, 20MB, JPG/JPEG/PNG/PDF 허용\n등록증 원본과 사업자 정보 일치 여부를 제출자가 대조하세요.\n이메일·프로필 사진 고지는 소스 보완 완료. 제출 전 공개 개인정보처리방침 URL의 수정 본문 반영을 확인하세요.\n신청 제출은 실행하지 않았습니다. ZIP 파일 자체는 업로드하지 마세요.\n', encoding='utf-8-sig')
with ZipFile(ROOT / '카카오_재제출자료.zip', 'w', ZIP_DEFLATED) as z:
    for name in [pdf.name, '추가정보_붙여넣기.txt', '제출방법.txt']:
        z.write(ROOT / name, name)

doc = pdfium.PdfDocument(str(pdf))
proof_dir = ROOT / 'render-check'
proof_dir.mkdir(exist_ok=True)
for i in range(len(doc)):
    doc[i].render(scale=1.2).to_pil().save(proof_dir / f'page-{i + 1:02}.png')
previews = [Image.open(proof_dir / f'page-{i + 1:02}.png').convert('RGB') for i in range(len(doc))]
sheet = Image.new('RGB', (4 * 420, 2 * 600), '#dce2eb')
for i, im in enumerate(previews):
    im.thumbnail((408, 580))
    sheet.paste(im, ((i % 4) * 420 + 6, (i // 4) * 600 + 8))
sheet.save(proof_dir / 'all-pages.png')
assert len(doc) == 8
print({'pdf_pages': len(doc), 'pdf_bytes': pdf.stat().st_size, 'pdf_under_20mb': True, 'rendered_all_pages': True, 'created_kst': datetime.now(timezone(timedelta(hours=9))).isoformat()})
