provider "aws" {
  region = "ap-south-1" # Mumbai_region
  }
resource "aws_instance" "ec2-web" {
  ami             = "ami-08e5424edfe926b43" # ubuntu server 20.04
  instance_type   = "t2.micro"
  security_groups = [aws_security_group.myweb.name]
  key_name        = "my-key-pair"

  tags = {
    Name = "web-ec2-server"
  }
}
output "server_private_ip" {
  value = aws_instance.ec2-web.private_ip
}
output "server_public_ipv4" {
  value = aws_instance.ec2-web.public_ip
}
output "server_id" {
  value = aws_instance.ec2-web.id
}
resource "aws_key_pair" "my-key-pair" {
  key_name   = "my-key-pair"
  public_key = tls_private_key.rsa.public_key_openssh
}
resource "tls_private_key" "rsa" {
  algorithm = "RSA"
  rsa_bits  = 4096
}
resource "local_file" "my-key-pair" {
  content  = tls_private_key.rsa.private_key_pem
  filename = "my-key-pair"
}
resource "aws_security_group" "myweb" {
  name        = "myweb-security-group"
  description = "security group for HTTP inbound"
}

resource "aws_security_group_rule" "ssh_rule" {
  type        = "ingress"
  from_port   = 22
  to_port     = 22
  protocol    = "tcp"
  cidr_blocks = ["0.0.0.0/0"] # from anywhere
  security_group_id = aws_security_group.myweb.id  
}

resource "aws_security_group_rule" "http_rule" {
  type        = "ingress"
  from_port   = 80
  to_port     = 80
  protocol    = "tcp"
  cidr_blocks = ["0.0.0.0/0"] # from anywhere
  security_group_id = aws_security_group.myweb.id  
}
